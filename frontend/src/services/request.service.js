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

export { getRequests };
