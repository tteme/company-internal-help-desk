import { apiRequest } from "./api";

async function getBranches() {
  return apiRequest("/branches");
}

async function getBranchById(branchId) {
  return apiRequest(`/branches/${branchId}`);
}

async function createBranch(branchData) {
  return apiRequest("/branches", {
    method: "POST",
    body: JSON.stringify(branchData),
  });
}

async function updateBranch(branchId, branchData) {
  return apiRequest(`/branches/${branchId}`, {
    method: "PATCH",
    body: JSON.stringify(branchData),
  });
}

async function deactivateBranch(branchId) {
  return apiRequest(`/branches/${branchId}`, {
    method: "DELETE",
  });
}

export {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deactivateBranch,
};
