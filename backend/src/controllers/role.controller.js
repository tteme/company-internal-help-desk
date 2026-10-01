import {
  getRoles,
  getRoleById,
  getPermissions,
  updateRolePermissions,
} from "../services/role.service.js";

// ============================================================
// GET ALL ROLES
// ============================================================

export const getRolesController = async (req, res) => {
  try {
    const roles = await getRoles();

    return res.status(200).json({
      success: true,
      message: "Roles retrieved successfully.",
      data: roles,
    });
  } catch (error) {
    console.error("Get roles error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve roles.",
    });
  }
};

// ============================================================
// GET ROLE BY ID
// ============================================================

export const getRoleByIdController = async (req, res) => {
  try {
    const { id: roleId } = req.params;

    const role = await getRoleById(roleId);

    return res.status(200).json({
      success: true,
      message: "Role retrieved successfully.",
      data: role,
    });
  } catch (error) {
    console.error("Get role by ID error:", error);

    if (error.message === "Role not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve role.",
    });
  }
};

// ============================================================
// GET ALL PERMISSIONS
// ============================================================

export const getPermissionsController = async (req, res) => {
  try {
    const permissions = await getPermissions();

    return res.status(200).json({
      success: true,
      message: "Permissions retrieved successfully.",
      data: permissions,
    });
  } catch (error) {
    console.error("Get permissions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve permissions.",
    });
  }
};

// ============================================================
// UPDATE ROLE PERMISSIONS
// ============================================================

export const updateRolePermissionsController = async (req, res) => {
  try {
    const { id: roleId } = req.params;
    const { permissionIds } = req.body;

    // ----------------------------------------------------------
    // Validate request body
    // ----------------------------------------------------------

    if (!Array.isArray(permissionIds)) {
      return res.status(400).json({
        success: false,
        message: "permissionIds must be an array.",
      });
    }

    const role = await updateRolePermissions(roleId, permissionIds);

    return res.status(200).json({
      success: true,
      message: "Role permissions updated successfully.",
      data: role,
    });
  } catch (error) {
    console.error("Update role permissions error:", error);

    if (error.message === "Role not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "One or more permissions not found.") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update role permissions.",
    });
  }
};
