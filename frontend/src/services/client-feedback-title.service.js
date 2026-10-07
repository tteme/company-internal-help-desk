import { apiRequest } from "./api";

async function getActiveClientFeedbackTitles() {
  return apiRequest("/client-feedback-titles");
}

async function getClientFeedbackTitles() {
  return apiRequest("/client-feedback-titles/admin");
}

async function getClientFeedbackTitleById(id) {
  return apiRequest(`/client-feedback-titles/${id}`);
}

async function createClientFeedbackTitle(name) {
  return apiRequest("/client-feedback-titles", {
    method: "POST",
    body: JSON.stringify({
      name,
    }),
  });
}

async function updateClientFeedbackTitle(id, name, isActive) {
  return apiRequest(`/client-feedback-titles/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      name,
      isActive,
    }),
  });
}

async function deactivateClientFeedbackTitle(id) {
  return apiRequest(`/client-feedback-titles/${id}`, {
    method: "DELETE",
  });
}

export {
  getActiveClientFeedbackTitles,
  getClientFeedbackTitles,
  getClientFeedbackTitleById,
  createClientFeedbackTitle,
  updateClientFeedbackTitle,
  deactivateClientFeedbackTitle,
};
