import prisma from "../config/database.js";
import { comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";

export const login = async (email, password) => {
  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { email },
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

  // 3. Check account status
  if (user.status !== "ACTIVE" || !user.isActive) {
    throw new Error("Your account is not active.");
  }

  // 4. Check password exists
  if (!user.passwordHash) {
    throw new Error("Your account has not been activated.");
  }

  // 5. Compare password
  const passwordMatches = await comparePassword(password, user.passwordHash);

  if (!passwordMatches) {
    throw new Error("Invalid email or password.");
  }

  // 6. Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
    },
  });

  // 7. Generate JWT
  const token = generateToken({
    userId: user.id,
  });

  // 8. Build permissions list
  const permissions = [
    ...new Set(
      user.userRoles.flatMap((userRole) =>
        userRole.role.rolePermissions.map(
          (rolePermission) => rolePermission.permission.name,
        ),
      ),
    ),
  ];

  // 9. Never return passwordHash
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
