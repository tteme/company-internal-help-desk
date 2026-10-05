import prisma from "../config/database.js";
import { comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";

export const login = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      branch: true,
      department: true,
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // 2. User does not exist
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  // 3. Check account status and password existence together,
  // using one generic message so the response doesn't reveal
  // which specific condition failed.
  if (user.status !== "ACTIVE" || !user.isActive || !user.passwordHash) {
    console.warn(
      `Login blocked for ${normalizedEmail}: status=${user.status}, isActive=${user.isActive}, hasPassword=${!!user.passwordHash}`,
    );

    throw new Error("Invalid email or password.");
  }

  // 4. Compare password
  const passwordMatches = await comparePassword(password, user.passwordHash);

  if (!passwordMatches) {
    throw new Error("Invalid email or password.");
  }

  // 5. Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
    },
  });

  // 6. Generate JWT
  const token = generateToken({
    userId: user.id,
  });

  // 7. Build permissions list
  const permissions = [
    ...new Set(
      user.userRoles.flatMap((userRole) =>
        userRole.role.rolePermissions.map(
          (rolePermission) => rolePermission.permission.name,
        ),
      ),
    ),
  ];

  // 8. Never return passwordHash
  return {
    token,
    user: {
      id: user.id,
      employeeId: user.employeeId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      branch: user.branch,
      department: user.department,
      permissions,
    },
  };
};
