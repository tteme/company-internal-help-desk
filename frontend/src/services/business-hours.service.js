import { apiRequest } from "./api";

// Get all business hours (all 7 days)
async function getBusinessHours() {
  return apiRequest("/business-hours");
}

// Get business hours for a specific day
async function getBusinessHoursByDay(day) {
  return apiRequest(`/business-hours/${day}`);
}

// Update business hours for a specific day
async function updateBusinessHours(day, data) {
  return apiRequest(`/business-hours/${day}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export { getBusinessHours, getBusinessHoursByDay, updateBusinessHours };
