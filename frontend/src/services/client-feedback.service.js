import { apiRequest } from "./api";

async function createClientFeedback(
  fullName,
  titleId,
  phoneNumber,
  description,
) {
  return apiRequest("/client-feedback", {
    method: "POST",
    body: JSON.stringify({
      fullName,
      titleId,
      phoneNumber,
      description,
    }),
  });
}
async function getClientFeedbacks() {
  return apiRequest("/client-feedback");
}

async function getClientFeedbackById(id) {
  return apiRequest(`/client-feedback/${id}`);
}

async function assignClientFeedback(id, departmentId, assignedToId) {
  return apiRequest(`/client-feedback/${id}/assign`, {
    method: "PATCH",
    body: JSON.stringify({
      departmentId,
      assignedToId,
    }),
  });
}

async function updateClientFeedbackStatus(id, status) {
  return apiRequest(`/client-feedback/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
    }),
  });
}

async function addClientFeedbackUpdate(id, message) {
  return apiRequest(`/client-feedback/${id}/updates`, {
    method: "POST",
    body: JSON.stringify({
      message,
    }),
  });
}

export {
  createClientFeedback,
  getClientFeedbacks,
  getClientFeedbackById,
  assignClientFeedback,
  updateClientFeedbackStatus,
  addClientFeedbackUpdate,
};



