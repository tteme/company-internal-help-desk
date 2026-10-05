import { apiRequest } from "./api";

async function getSystemStatus() {
  return apiRequest("/system-status");
}

export { getSystemStatus };
