import { apiRequest } from "./api";

// Get the overview report for a given date range
async function getOverviewReport(startDate, endDate) {
  const params = new URLSearchParams();

  if (startDate) {
    params.set("startDate", startDate);
  }

  if (endDate) {
    params.set("endDate", endDate);
  }

  const queryString = params.toString();

  return apiRequest(`/reports/overview${queryString ? `?${queryString}` : ""}`);
}

export { getOverviewReport };
