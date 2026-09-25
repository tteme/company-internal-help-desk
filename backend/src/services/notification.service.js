import prisma from "../config/database.js";

const VALID_NOTIFICATION_TYPES = [
  "REQUEST_CREATED",
  "REQUEST_ASSIGNED",
  "REQUEST_REASSIGNED",
  "REQUEST_COMMENT",
  "REQUEST_ESCALATED",
  "SLA_WARNING",
  "SLA_BREACHED",
  "REQUEST_RESOLVED",
  "REQUEST_CLOSED",
  "ACCOUNT_CREATED",
  "ACCOUNT_ACTIVATED",
  "SYSTEM_NOTIFICATION",
];

const VALID_NOTIFICATION_CHANNELS = ["IN_APP", "EMAIL"];

export const createNotification = async ({
  userId,
  requestId = null,
  type,
  channel = "IN_APP",
  title,
  message,
  db = prisma,
}) => {
  if (!userId) {
    throw new Error("Notification user ID is required.");
  }

  if (!VALID_NOTIFICATION_TYPES.includes(type)) {
    throw new Error(`Invalid notification type: ${type}`);
  }

  if (!VALID_NOTIFICATION_CHANNELS.includes(channel)) {
    throw new Error(`Invalid notification channel: ${channel}`);
  }

  if (!title || !title.trim()) {
    throw new Error("Notification title is required.");
  }

  if (!message || !message.trim()) {
    throw new Error("Notification message is required.");
  }

  return db.notification.create({
    data: {
      userId,
      requestId,
      type,
      channel,
      status: channel === "IN_APP" ? "SENT" : "PENDING",
      title: title.trim(),
      message: message.trim(),
    },
  });
};
export const getUserNotifications = async ({ userId, unreadOnly = false }) => {
  const where = {
    userId,
  };

  if (unreadOnly) {
    where.status = {
      not: "READ",
    };
  }

  return prisma.notification.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const markNotificationAsRead = async ({ notificationId, userId }) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new Error("Notification not found.");
  }

  if (notification.status === "READ") {
    return notification;
  }

  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      status: "READ",
      readAt: new Date(),
    },
  });
};

export const markAllNotificationsAsRead = async ({ userId }) => {
  return prisma.notification.updateMany({
    where: {
      userId,
      status: {
        not: "READ",
      },
    },
    data: {
      status: "READ",
      readAt: new Date(),
    },
  });
};

export const getUnreadNotificationCount = async ({ userId }) => {
  return prisma.notification.count({
    where: {
      userId,
      status: {
        not: "READ",
      },
    },
  });
};