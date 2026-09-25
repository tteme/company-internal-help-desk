import { apiRequest } from "./api";

// Get all SLA policies
async function getSlaPolicies() {
  return apiRequest("/sla");
}

// Get a single SLA policy
async function getSlaPolicyById(slaPolicyId) {
  return apiRequest(`/sla/${slaPolicyId}`);
}

// Create an SLA policy
async function createSlaPolicy(slaPolicyData) {
  return apiRequest("/sla", {
    method: "POST",
    body: JSON.stringify(slaPolicyData),
  });
}

// Update an SLA policy
async function updateSlaPolicy(slaPolicyId, slaPolicyData) {
  return apiRequest(`/sla/${slaPolicyId}`, {
    method: "PATCH",
    body: JSON.stringify(slaPolicyData),
  });
}

// Deactivate an SLA policy (DELETE = soft deactivate on the backend)
async function deactivateSlaPolicy(slaPolicyId) {
  return apiRequest(`/sla/${slaPolicyId}`, {
    method: "DELETE",
  });
}

// Reactivate — no dedicated route, so PATCH isActive back to true
async function reactivateSlaPolicy(slaPolicyId) {
  return apiRequest(`/sla/${slaPolicyId}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive: true }),
  });
}

export {
  getSlaPolicies,
  getSlaPolicyById,
  createSlaPolicy,
  updateSlaPolicy,
  deactivateSlaPolicy,
  reactivateSlaPolicy,
};
