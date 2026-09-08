import crypto from "crypto";
import prisma from "../config/database.js";
import { hashPassword } from "../utils/password.js";
import { sendActivationEmail } from "./email.service.js";

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

  // Validate role-specific requirements
  if (
    role === "EMPLOYEE" ||
    role === "DEPARTMENT_OFFICER" ||
    role === "DEPARTMENT_HEAD"
  ) {
    if (!branchId) {
      throw new Error("Branch is required for this user role.");
    }
  }

  if (role === "DEPARTMENT_OFFICER" || role === "DEPARTMENT_HEAD") {
    if (!departmentId) {
      throw new Error("Department is required for this user role.");
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
};;
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

  if (updatedByRole === "ADMIN") {
    if (!adminAllowedRoles.includes(newRole)) {
      throw new Error(
        "Admins cannot assign Admin or System Administrator roles.",
      );
    }
  } else if (updatedByRole !== "SYSTEM_ADMINISTRATOR") {
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
  // 5. VALIDATE ROLE
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
  // 6. VALIDATE BRANCH REQUIREMENTS
  // ============================================================

  const branchRequiredRoles = [
    "EMPLOYEE",
    "DEPARTMENT_OFFICER",
    "DEPARTMENT_HEAD",
  ];

  if (branchRequiredRoles.includes(newRole) && !branchId) {
    throw new Error("Branch is required for this role.");
  }

  // ADMIN and SYSTEM_ADMINISTRATOR do not belong to a branch.
  const finalBranchId = branchRequiredRoles.includes(newRole) ? branchId : null;

  // ============================================================
  // 7. VALIDATE DEPARTMENT REQUIREMENTS
  // ============================================================

  const departmentRequiredRoles = ["DEPARTMENT_OFFICER", "DEPARTMENT_HEAD"];

  if (departmentRequiredRoles.includes(newRole) && !departmentId) {
    throw new Error("Department is required for this role.");
  }

  // Employees, Admins and System Administrators do not belong
  // to a department.
  const finalDepartmentId = departmentRequiredRoles.includes(newRole)
    ? departmentId
    : null;

  // ============================================================
  // 7. UPDATE USER AND ROLE ASSIGNMENT IN ONE TRANSACTION
  // ============================================================

  const updatedUser = await prisma.$transaction(async (tx) => {
    // ----------------------------------------------------------
    // 7.1 Update the User record
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
    // 7.2 Keep UserRoleAssignment synchronized
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
  // 8. RETURN UPDATED USER
  // ============================================================

  return updatedUser;
};;


