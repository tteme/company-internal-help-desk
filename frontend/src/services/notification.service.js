
import { apiRequest } from "./api";

async function getNotifications() {
  return apiRequest("/notifications");
}

async function getUnreadNotifications() {
  return apiRequest("/notifications/unread");
}

async function getUnreadNotificationCount() {
  return apiRequest("/notifications/unread/count");
}

async function markNotificationAsRead(notificationId) {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}
async function markAllNotificationsAsRead() {
  return apiRequest("/notifications/read-all", {
    method: "PATCH",
  });
}

export {
  getNotifications,
  getUnreadNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
