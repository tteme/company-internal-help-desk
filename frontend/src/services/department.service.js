import { apiRequest } from "./api";

async function getDepartments() {
  return apiRequest("/departments");
}

async function getDepartmentById(departmentId) {
  return apiRequest(`/departments/${departmentId}`);
}

async function createDepartment(departmentData) {
  return apiRequest("/departments", {
    method: "POST",
    body: JSON.stringify(departmentData),
  });
}

async function updateDepartment(departmentId, departmentData) {
  return apiRequest(`/departments/${departmentId}`, {
    method: "PATCH",
    body: JSON.stringify(departmentData),
  });
}

async function deactivateDepartment(departmentId) {
  return apiRequest(`/departments/${departmentId}`, {
    method: "DELETE",
  });
}

export {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deactivateDepartment,
};
