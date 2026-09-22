import { apiRequest } from "./api";

async function getRequests({
  page = 1,
  limit = 20,
  search = "",
  status = "",
  priority = "",
} = {}) {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("limit", limit);

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (status) {
    params.set("status", status);
  }

  if (priority) {
    params.set("priority", priority);
  }

  return apiRequest(`/requests?${params.toString()}`);
}
async function createRequest(title, description) {
  return apiRequest("/requests", {
    method: "POST",
    body: JSON.stringify({
      title,
      description,
    }),
  });
}
async function startRequest(requestId) {
  return apiRequest(`/requests/${requestId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "IN_PROGRESS",
    }),
  });
}
async function resolveRequest(requestId, message) {
  return apiRequest(`/requests/${requestId}/resolve`, {
    method: "PATCH",
    body: JSON.stringify({
      message,
    }),
  });
}

async function confirmOrRejectRequest(requestId, decision, message = "") {
  return apiRequest(`/requests/${requestId}/confirmation`, {
    method: "PATCH",
    body: JSON.stringify({
      decision,
      message,
    }),
  });
}

async function rateRequest(requestId, rating, comment = "") {
  return apiRequest(`/requests/${requestId}/rating`, {
    method: "POST",
    body: JSON.stringify({
      rating,
      comment,
    }),
  });
}

export {
  getRequests,
  createRequest,
  startRequest,
  resolveRequest,
  confirmOrRejectRequest,
  rateRequest,
};
