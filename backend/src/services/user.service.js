import crypto from "crypto";
import prisma from "../config/database.js";
import { hashPassword } from "../utils/password.js";
import { sendActivationEmail } from "./email.service.js";

// ============================================================
// DEVELOPMENT TESTING
// Generate a fresh activation token for local testing.
// This must never be available in production.
// ============================================================
export const generateDevelopmentActivationToken = async (userId) => {
  // 1. Make sure this helper is only available in development.
  if (process.env.NODE_ENV !== "development") {
    throw new Error(
      "Development activation is only available in development mode.",
    );
  }

  // 2. Find the pending user.
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  // 3. Only pending accounts can be activated.
  if (user.status !== "PENDING" || user.isActive) {
    throw new Error("Only pending user accounts can be activated.");
  }

  // 4. Generate a new raw activation token.
  const rawToken = crypto.randomBytes(32).toString("hex");

  // 5. Hash the token before storing it in the database.
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  // 6. Give the token a fresh 24-hour expiration time.
  const activationExpires = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  );

  // 7. Store only the hashed token.
  await prisma.user.update({
    where: { id: userId },
    data: {
      activationToken: hashedToken,
      activationExpires,
    },
  });

  // 8. Return the raw token only for local development testing.
  return {
    userId: user.id,
    email: user.email,
    activationToken: rawToken,
    activationExpires,
  };
};
// ============================================================
// CREATE USERS
// ============================================================
export const createUser = async ({
  employeeId,
  firstName,
  lastName,
  email,
  phone,
  role,
  branchId,
  departmentId,
  createdByRole,
}) => {
  // ============================================================
  // 1. VALIDATE ROLE-CREATION AUTHORITY
  // ============================================================

  const systemAdministratorCreatableRoles = [
    "EMPLOYEE",
    "DEPARTMENT_OFFICER",
    "DEPARTMENT_HEAD",
    "ADMIN",
    "SYSTEM_ADMINISTRATOR",
  ];

  const adminCreatableRoles = [
    "EMPLOYEE",
    "DEPARTMENT_OFFICER",
    "DEPARTMENT_HEAD",
  ];

  if (createdByRole === "SYSTEM_ADMINISTRATOR") {
    if (!systemAdministratorCreatableRoles.includes(role)) {
      throw new Error("You are not authorized to create this user role.");
    }
  } else if (createdByRole === "ADMIN") {
    if (!adminCreatableRoles.includes(role)) {
      throw new Error(
        "Admins cannot create Admin or System Administrator accounts.",
      );
    }
  } else {
    throw new Error("You are not authorized to create user accounts.");
  }

  // ============================================================
  // 2. CHECK WHETHER EMPLOYEE ID ALREADY EXISTS
  // ============================================================

  const existingEmployee = await prisma.user.findUnique({
    where: {
      employeeId,
    },
  });

  if (existingEmployee) {
    throw new Error("Employee ID already exists.");
  }

  // Check whether email already exists
  const existingEmail = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingEmail) {
    throw new Error("Email address already exists.");
  }

  // ============================================================
  // 3. VALIDATE BRANCH AND DEPARTMENT REQUIREMENTS
  // ============================================================

  const branchRequiredRoles = [
    "EMPLOYEE",
    "DEPARTMENT_OFFICER",
    "DEPARTMENT_HEAD",
  ];

  const departmentRequiredRoles = ["DEPARTMENT_OFFICER", "DEPARTMENT_HEAD"];

  // ------------------------------------------------------------
  // 3.1 Validate branch requirement
  // ------------------------------------------------------------

  if (branchRequiredRoles.includes(role) && !branchId) {
    throw new Error("Branch is required for this user role.");
  }

  // ------------------------------------------------------------
  // 3.2 Validate department requirement
  // ------------------------------------------------------------

  if (departmentRequiredRoles.includes(role) && !departmentId) {
    throw new Error("Department is required for this user role.");
  }

  // ------------------------------------------------------------
  // 3.3 Verify branch exists and is active
  // ------------------------------------------------------------

  if (branchRequiredRoles.includes(role)) {
    const branch = await prisma.branch.findUnique({
      where: {
        id: branchId,
      },
    });

    if (!branch) {
      throw new Error("Branch not found.");
    }

    if (!branch.isActive) {
      throw new Error("Cannot assign user to an inactive branch.");
    }
  }

  // ------------------------------------------------------------
  // 3.4 Verify department exists and is active
  // ------------------------------------------------------------

  if (departmentRequiredRoles.includes(role)) {
    const department = await prisma.department.findUnique({
      where: {
        id: departmentId,
      },
    });

    if (!department) {
      throw new Error("Department not found.");
    }

    if (!department.isActive) {
      throw new Error("Cannot assign user to an inactive department.");
    }
  }

  // Generate activation token
  const activationToken = crypto.randomBytes(32).toString("hex");

  const activationTokenHash = crypto
    .createHash("sha256")
    .update(activationToken)
    .digest("hex");

  // Token expires in 24 hours
  const activationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Find the role record
  const roleRecord = await prisma.role.findUnique({
    where: {
      name: role,
    },
  });

  if (!roleRecord) {
    throw new Error("Role not found.");
  }

  // Create the user and role assignment together
  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        employeeId,
        firstName,
        lastName,
        email,
        phone: phone || null,

        // Password will be created during activation
        passwordHash: null,

        role,
        status: "PENDING",
        availability: "AVAILABLE",

        branchId: branchId || null,
        departmentId: departmentId || null,

        emailVerified: false,
        isActive: false,

        activationToken: activationTokenHash,
        activationExpires,
      },
    });

    await tx.userRoleAssignment.create({
      data: {
        userId: createdUser.id,
        roleId: roleRecord.id,
      },
    });
    return createdUser;
  });
  // Send email
  await sendActivationEmail({
    to: user.email,
    firstName: user.firstName,
    activationToken,
  });
  return {
    id: user.id,
    employeeId: user.employeeId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    branchId: user.branchId,
    departmentId: user.departmentId,
    emailVerified: user.emailVerified,
    isActive: user.isActive,
    activationExpires: user.activationExpires,
    createdAt: user.createdAt,
  };
};
export const activateUser = async (token, password) => {
  // Hash the token received from the activation link
  const activationTokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // Find the user using the hashed token
  const user = await prisma.user.findUnique({
    where: {
      activationToken: activationTokenHash,
    },
  });

  if (!user) {
    throw new Error("Invalid activation token.");
  }

  // Check whether the token has expired
  if (user.activationExpires && user.activationExpires < new Date()) {
    throw new Error("Activation token has expired.");
  }

  // Prevent an already activated account from being activated again
  if (user.status !== "PENDING") {
    throw new Error("User account has already been activated.");
  }

  // Hash the employee's new password
  const passwordHash = await hashPassword(password);

  // Activate the account
  const activatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash,
      status: "ACTIVE",
      isActive: true,
      emailVerified: true,

      // Token can no longer be used
      activationToken: null,
      activationExpires: null,
    },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
      emailVerified: true,
      isActive: true,
      createdAt: true,
    },
  });

  return activatedUser;
};
// ============================================================
// GET ALL USERS
// ============================================================
export const getUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      availability: true,
      emailVerified: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,

      branch: {
        select: {
          id: true,
          name: true,
        },
      },

      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
};
// ============================================================
// GET USER BY ID
// ============================================================
export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      availability: true,
      emailVerified: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,

      branch: {
        select: {
          id: true,
          name: true,
        },
      },

      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
};
// ============================================================
// UPDATE USER
// ============================================================

export const updateUser = async (id, data) => {
  // ============================================================
  // 1. FIND EXISTING USER
  // ============================================================

  const existingUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!existingUser) {
    throw new Error("User not found.");
  }

  // ============================================================
  // 2. PREPARE UPDATED VALUES
  // ============================================================

  const {
    employeeId,
    firstName,
    lastName,
    email,
    phone,
    role,
    branchId,
    departmentId,
    updatedByRole,
  } = data;

  const newRole = role || existingUser.role;
  // ============================================================
  // 3. VALIDATE ROLE-CHANGE AUTHORITY
  // ============================================================

  const adminAllowedRoles = [
    "EMPLOYEE",
    "DEPARTMENT_OFFICER",
    "DEPARTMENT_HEAD",
  ];

  const privilegedRoles = ["ADMIN", "SYSTEM_ADMINISTRATOR"];

  // ------------------------------------------------------------
  // 3.1 ADMIN AUTHORITY
  // ------------------------------------------------------------

  if (updatedByRole === "ADMIN") {
    // Admin cannot modify privileged accounts.
    if (privilegedRoles.includes(existingUser.role)) {
      throw new Error(
        "Admins cannot modify Admin or System Administrator accounts.",
      );
    }

    // Admin can only manage operational roles.
    if (!adminAllowedRoles.includes(newRole)) {
      throw new Error(
        "Admins cannot assign Admin or System Administrator roles.",
      );
    }
  }

  // ------------------------------------------------------------
  // 3.2 SYSTEM ADMINISTRATOR AUTHORITY
  // ------------------------------------------------------------
  else if (updatedByRole === "SYSTEM_ADMINISTRATOR") {
    // System Administrator can manage all user roles.
  }

  // ------------------------------------------------------------
  // 3.3 OTHER ROLES
  // ------------------------------------------------------------
  else {
    throw new Error("You are not authorized to update user accounts.");
  }

  // ============================================================
  // 4. CHECK EMAIL UNIQUENESS
  // ============================================================

  if (email && email !== existingUser.email) {
    const existingEmailUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmailUser && existingEmailUser.id !== id) {
      throw new Error("Email is already in use.");
    }
  }
  // ============================================================
  // 5. CHECK EMPLOYEE ID UNIQUENESS
  // ============================================================

  if (employeeId && employeeId !== existingUser.employeeId) {
    const existingEmployeeIdUser = await prisma.user.findUnique({
      where: {
        employeeId,
      },
    });

    if (existingEmployeeIdUser && existingEmployeeIdUser.id !== id) {
      throw new Error("Employee ID already exists.");
    }
  }
  // ============================================================
  // 6. VALIDATE ROLE
  // ============================================================

  const roleRecord = await prisma.role.findUnique({
    where: {
      name: newRole,
    },
  });

  if (!roleRecord) {
    throw new Error("Selected role does not exist.");
  }

  // ============================================================
  // 7. VALIDATE BRANCH REQUIREMENTS
  // ============================================================

  const branchRequiredRoles = [
    "EMPLOYEE",
    "DEPARTMENT_OFFICER",
    "DEPARTMENT_HEAD",
  ];

  // ------------------------------------------------------------
  // 7.1 Determine the final branch
  // ------------------------------------------------------------

  // If branchId is provided, use the new branch.
  // Otherwise, keep the user's existing branch.
  const finalBranchId = branchRequiredRoles.includes(newRole)
    ? branchId !== undefined
      ? branchId
      : existingUser.branchId
    : null;

  // ------------------------------------------------------------
  // 7.2 Validate branch requirement
  // ------------------------------------------------------------

  if (branchRequiredRoles.includes(newRole) && !finalBranchId) {
    throw new Error("Branch is required for this role.");
  }

  // ------------------------------------------------------------
  // 7.3 Verify branch exists and is active
  // ------------------------------------------------------------

  if (branchRequiredRoles.includes(newRole)) {
    const branch = await prisma.branch.findUnique({
      where: {
        id: finalBranchId,
      },
    });

    if (!branch) {
      throw new Error("Branch not found.");
    }

    if (!branch.isActive) {
      throw new Error("Cannot assign user to an inactive branch.");
    }
  }

  // ============================================================
  // 8. VALIDATE DEPARTMENT REQUIREMENTS
  // ============================================================

  const departmentRequiredRoles = ["DEPARTMENT_OFFICER", "DEPARTMENT_HEAD"];

  // ------------------------------------------------------------
  // 8.1 Determine the final department
  // ------------------------------------------------------------

  // If departmentId is provided, use the new department.
  // Otherwise, keep the user's existing department.
  const finalDepartmentId = departmentRequiredRoles.includes(newRole)
    ? departmentId !== undefined
      ? departmentId
      : existingUser.departmentId
    : null;

  // ------------------------------------------------------------
  // 8.2 Validate department requirement
  // ------------------------------------------------------------

  if (departmentRequiredRoles.includes(newRole) && !finalDepartmentId) {
    throw new Error("Department is required for this role.");
  }

  // ------------------------------------------------------------
  // 8.3 Verify department exists and is active
  // ------------------------------------------------------------

  if (departmentRequiredRoles.includes(newRole)) {
    const department = await prisma.department.findUnique({
      where: {
        id: finalDepartmentId,
      },
    });

    if (!department) {
      throw new Error("Department not found.");
    }

    if (!department.isActive) {
      throw new Error("Cannot assign user to an inactive department.");
    }
  }
  // ============================================================
  // 9. UPDATE USER AND ROLE ASSIGNMENT IN ONE TRANSACTION
  // ============================================================

  const updatedUser = await prisma.$transaction(async (tx) => {
    // ----------------------------------------------------------
    // 9.1 Update the User record
    // ----------------------------------------------------------

    const user = await tx.user.update({
      where: {
        id,
      },
      data: {
        ...(employeeId !== undefined && { employeeId }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        role: newRole,
        branchId: finalBranchId,
        departmentId: finalDepartmentId,
      },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isActive: true,
        emailVerified: true,
        branch: true,
        department: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // ----------------------------------------------------------
    // 9.2 Keep UserRoleAssignment synchronized
    // ----------------------------------------------------------

    // The system uses User.role as the user's single business role.
    // Therefore, remove any old role assignments first.
    await tx.userRoleAssignment.deleteMany({
      where: {
        userId: id,
      },
    });

    // Create exactly one role assignment matching User.role.
    await tx.userRoleAssignment.create({
      data: {
        userId: id,
        roleId: roleRecord.id,
      },
    });

    return user;
  });

  // ============================================================
  // 10. RETURN UPDATED USER
  // ============================================================

  return updatedUser;
};

// ============================================================
// DEACTIVATE USER ACCOUNT
// ============================================================
export const deactivateUser = async (id) => {
  // ============================================================
  // 1. FIND EXISTING USER
  // ============================================================

  const existingUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!existingUser) {
    throw new Error("User not found.");
  }

  // ============================================================
  // 2. CHECK WHETHER USER IS ALREADY INACTIVE
  // ============================================================

  if (!existingUser.isActive || existingUser.status !== "ACTIVE") {
    throw new Error("User account is already inactive.");
  }

  // ============================================================
  // 3. DEACTIVATE USER ACCOUNT
  // ============================================================

  const deactivatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      status: "INACTIVE",
      isActive: false,
      availability: "UNAVAILABLE",
    },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
      availability: true,
      emailVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // ============================================================
  // 4. RETURN DEACTIVATED USER
  // ============================================================

  return deactivatedUser;
};

// ============================================================
// REACTIVATE USER ACCOUNT
// ============================================================

export const reactivateUser = async (id) => {
  // 1. FIND EXISTING USER
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error("User not found.");
  }

  // 2. CHECK WHETHER USER IS ALREADY ACTIVE
  if (existingUser.isActive && existingUser.status === "ACTIVE") {
    throw new Error("User account is already active.");
  }

  // 3. REACTIVATE USER ACCOUNT
  const reactivatedUser = await prisma.user.update({
    where: { id },
    data: {
      status: "ACTIVE",
      isActive: true,
      availability: "AVAILABLE",
    },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
      availability: true,
      emailVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return reactivatedUser;
};