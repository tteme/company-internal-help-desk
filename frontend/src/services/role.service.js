import { apiRequest } from "./api.js";

// ============================================================
// GET ALL ROLES
// ============================================================

export const getRoles = async () => {
  return await apiRequest("/roles");
};

// ============================================================
// GET ROLE BY ID
// ============================================================

export const getRoleById = async (roleId) => {
  return await apiRequest(`/roles/${roleId}`);
};

// ============================================================
// GET ALL PERMISSIONS
// ============================================================

export const getPermissions = async () => {
  return await apiRequest("/roles/permissions");
};

// ============================================================
// UPDATE ROLE PERMISSIONS
// ============================================================

export const updateRolePermissions = async (roleId, permissionIds) => {
  return await apiRequest(`/roles/${roleId}/permissions`, {
    method: "PUT",
    body: JSON.stringify({
      permissionIds,
    }),
  });
};
