import prisma from "../config/database.js";

export const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const role = await prisma.role.findUnique({
        where: {
          name: req.user.role,
        },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (!role) {
        return res.status(403).json({
          success: false,
          message: "User role not found.",
        });
      }

      const hasPermission = role.rolePermissions.some(
        (rolePermission) => rolePermission.permission.name === permissionName,
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action.",
        });
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to verify permission.",
      });
    }
  };
};

export const requireRequestConfirmationPermission = async (req, res, next) => {
  try {
    const { decision } = req.body;

    let requiredPermission;

    if (decision === "CONFIRM") {
      requiredPermission = "request.confirm_resolution";
    } else if (decision === "REJECT") {
      requiredPermission = "request.reject_resolution";
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid confirmation decision.",
      });
    }

    const role = await prisma.role.findUnique({
      where: {
        name: req.user.role,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      return res.status(403).json({
        success: false,
        message: "User role not found.",
      });
    }

    const hasPermission = role.rolePermissions.some(
      (rolePermission) => rolePermission.permission.name === requiredPermission,
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }

    next();
  } catch (error) {
    console.error("Request confirmation permission error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check permissions.",
    });
  }
};
