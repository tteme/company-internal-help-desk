import prisma from "../config/database.js";

// ============================================================
// GET ALL ROLES
// ============================================================

export const getRoles = async () => {
  const roles = await prisma.role.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          permissions: true,
          rolePermissions: true,
        },
      },
    },
  });

  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    userCount: role._count.permissions,
    permissionCount: role._count.rolePermissions,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  }));
};

// ============================================================
// GET ROLE BY ID
// ============================================================

export const getRoleById = async (roleId) => {
  const role = await prisma.role.findUnique({
    where: {
      id: roleId,
    },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
        orderBy: {
          permission: {
            name: "asc",
          },
        },
      },
      _count: {
        select: {
          permissions: true,
        },
      },
    },
  });

  if (!role) {
    throw new Error("Role not found.");
  }

  return {
    id: role.id,
    name: role.name,
    description: role.description,
    userCount: role._count.permissions,
    permissions: role.rolePermissions.map(
      (rolePermission) => rolePermission.permission,
    ),
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
};

// ============================================================
// GET ALL PERMISSIONS
// ============================================================

export const getPermissions = async () => {
  const permissions = await prisma.permission.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return permissions;
};

// ============================================================
// UPDATE ROLE PERMISSIONS
// ============================================================

export const updateRolePermissions = async (roleId, permissionIds) => {
  // ----------------------------------------------------------
  // Validate role
  // ----------------------------------------------------------

  const role = await prisma.role.findUnique({
    where: {
      id: roleId,
    },
  });

  if (!role) {
    throw new Error("Role not found.");
  }

  // ----------------------------------------------------------
  // Validate permission IDs
  // ----------------------------------------------------------

  const uniquePermissionIds = [...new Set(permissionIds)];

  const permissions = await prisma.permission.findMany({
    where: {
      id: {
        in: uniquePermissionIds,
      },
    },
  });

  if (permissions.length !== uniquePermissionIds.length) {
    throw new Error("One or more permissions not found.");
  }

  // ----------------------------------------------------------
  // Replace role permissions in a transaction
  // ----------------------------------------------------------

  await prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({
      where: {
        roleId,
      },
    });

    if (uniquePermissionIds.length > 0) {
      await tx.rolePermission.createMany({
        data: uniquePermissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      });
    }
  });

  // ----------------------------------------------------------
  // Return updated role
  // ----------------------------------------------------------

  return await getRoleById(roleId);
};
