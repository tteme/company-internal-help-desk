import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notification.service.js";

export const getNotificationsController = async (req, res) => {
  try {
    console.log("Notification request user ID:", req.user.id);
    const notifications = await getUserNotifications({
      userId: req.user.id,
      unreadOnly: false,
    });

    return res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully.",
      data: notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve notifications.",
    });
  }
};

export const getUnreadNotificationsController = async (req, res) => {
  try {
    const notifications = await getUserNotifications({
      userId: req.user.id,
      unreadOnly: true,
    });

    return res.status(200).json({
      success: true,
      message: "Unread notifications retrieved successfully.",
      data: notifications,
    });
  } catch (error) {
    console.error("Get unread notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve unread notifications.",
    });
  }
};

export const markNotificationAsReadController = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await markNotificationAsRead({
      notificationId: id,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    if (error.message === "Notification not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read.",
    });
  }
};

export const markAllNotificationsAsReadController = async (req, res) => {
  try {
    const result = await markAllNotificationsAsRead({
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      data: {
        count: result.count,
      },
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read.",
    });
  }
};

export const getUnreadNotificationCountController = async (req, res) => {
  try {
    const count = await getUnreadNotificationCount({
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Unread notification count retrieved successfully.",
      data: {
        count,
      },
    });
  } catch (error) {
    console.error("Get unread notification count error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve unread notification count.",
    });
  }
};