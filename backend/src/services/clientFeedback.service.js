import prisma from "../config/database.js";
import { createNotification } from "./notification.service.js";

// ============================================================
// CREATE CLIENT FEEDBACK
// ============================================================

export const createClientFeedback = async ({
  fullName,
  titleId,
  phoneNumber,
  description,
}) => {
  const feedback = await prisma.$transaction(async (tx) => {
    // Verify that the selected feedback title exists and is active.
    const title = await tx.clientFeedbackTitle.findFirst({
      where: {
        id: titleId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!title) {
      throw new Error("Feedback title not found or inactive.");
    }

    // Atomically get the next feedback reference number
    const sequence = await tx.clientFeedbackSequence.upsert({
      where: {
        id: 1,
      },
      create: {
        id: 1,
        value: 1,
      },
      update: {
        value: {
          increment: 1,
        },
      },
      select: {
        value: true,
      },
    });

    const referenceNumber = `FB-${String(sequence.value).padStart(6, "0")}`;

    const createdFeedback = await tx.clientFeedback.create({
      data: {
        referenceNumber,
        fullName: fullName.trim(),
        titleId: title.id,
        phoneNumber: phoneNumber.trim(),
        description: description.trim(),
        status: "PENDING_REVIEW",
      },
    });

    const administrators = await tx.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "SYSTEM_ADMINISTRATOR"],
        },
        status: "ACTIVE",
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    for (const administrator of administrators) {
      await createNotification({
        userId: administrator.id,
        feedbackId: createdFeedback.id,
        type: "CLIENT_FEEDBACK_SUBMITTED",
        channel: "IN_APP",
        title: "New Client Feedback",
        message: `A new client feedback submission (${createdFeedback.referenceNumber}) requires review.`,
        db: tx,
      });
    }

    return createdFeedback;
  });

  return {
    id: feedback.id,
    referenceNumber: feedback.referenceNumber,
    status: feedback.status,
    createdAt: feedback.createdAt,
  };
};

// ============================================================
// GET CLIENT FEEDBACKS
// ============================================================

export const getClientFeedbacks = async ({ userId, role, status }) => {
  const where = {};

  // ADMIN and SYSTEM_ADMINISTRATOR can see all feedback
  if (role === "ADMIN" || role === "SYSTEM_ADMINISTRATOR") {
    if (status) {
      where.status = status;
    }
  }

  // DEPARTMENT_OFFICER and DEPARTMENT_HEAD
  // can only see feedback assigned to them
  else if (role === "DEPARTMENT_OFFICER" || role === "DEPARTMENT_HEAD") {
    where.assignedToId = userId;

    if (status) {
      where.status = status;
    }
  }

  // Other roles cannot access client feedback
  else {
    throw new Error("You are not authorized to view client feedback.");
  }

  return prisma.clientFeedback.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      referenceNumber: true,
      fullName: true,
      phoneNumber: true,
      titleId: true,
      description: true,
      status: true,

      departmentId: true,
      assignedToId: true,
      assignedById: true,

      resolvedAt: true,
      closedAt: true,

      createdAt: true,
      updatedAt: true,

      title: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },

      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },

      assignedTo: {
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },

      assignedBy: {
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });
};

// ============================================================
// GET CLIENT FEEDBACK BY ID
// ============================================================

export const getClientFeedbackById = async ({ feedbackId, userId, role }) => {
  const feedback = await prisma.clientFeedback.findUnique({
    where: {
      id: feedbackId,
    },
    select: {
      id: true,
      referenceNumber: true,
      fullName: true,
      phoneNumber: true,

      titleId: true,
      title: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },

      description: true,
      status: true,

      departmentId: true,
      assignedToId: true,
      assignedById: true,

      resolvedAt: true,
      closedAt: true,

      createdAt: true,
      updatedAt: true,

      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },

      assignedTo: {
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },

      assignedBy: {
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },

      updates: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          message: true,
          createdAt: true,

          user: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      },
    },
  });

  if (!feedback) {
    throw new Error("Client feedback not found.");
  }

  // Admins can view all feedback
  if (role === "ADMIN" || role === "SYSTEM_ADMINISTRATOR") {
    return feedback;
  }

  // Department officers and heads can only view
  // feedback assigned to themselves
  if (role === "DEPARTMENT_OFFICER" || role === "DEPARTMENT_HEAD") {
    if (feedback.assignedToId !== userId) {
      throw new Error("You are not authorized to view this client feedback.");
    }

    return feedback;
  }

  throw new Error("You are not authorized to view this client feedback.");
};

// ============================================================
// ASSIGN CLIENT FEEDBACK
// ============================================================

export const assignClientFeedback = async ({
  feedbackId,
  departmentId,
  assignedToId,
  assignedById,
}) => {
  const feedback = await prisma.clientFeedback.findUnique({
    where: {
      id: feedbackId,
    },
    select: {
      id: true,
      referenceNumber: true,
      status: true,
    },
  });

  if (!feedback) {
    throw new Error("Client feedback not found.");
  }

  // Feedback should be assigned only while waiting for review
  if (feedback.status !== "PENDING_REVIEW") {
    throw new Error("Only feedback pending review can be assigned.");
  }

  const department = await prisma.department.findFirst({
    where: {
      id: departmentId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  if (!department) {
    throw new Error("Department not found or inactive.");
  }

  const assignedUser = await prisma.user.findFirst({
    where: {
      id: assignedToId,
      status: "ACTIVE",
      isActive: true,
      role: {
        in: ["DEPARTMENT_OFFICER", "DEPARTMENT_HEAD"],
      },
      departmentId,
    },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      role: true,
      departmentId: true,
    },
  });

  if (!assignedUser) {
    throw new Error(
      "The selected user is not an active department officer or department head in the selected department.",
    );
  }

  const feedbackWithAssignment = await prisma.$transaction(async (tx) => {
    const updatedFeedback = await tx.clientFeedback.update({
      where: {
        id: feedbackId,
      },
      data: {
        departmentId,
        assignedToId,
        assignedById,
        status: "ASSIGNED",
      },
      select: {
        id: true,
        referenceNumber: true,
        status: true,
        departmentId: true,
        assignedToId: true,
        assignedById: true,
        updatedAt: true,

        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },

        assignedTo: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },

        assignedBy: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    await createNotification({
      userId: assignedToId,
      feedbackId,
      type: "CLIENT_FEEDBACK_ASSIGNED",
      channel: "IN_APP",
      title: "Client Feedback Assigned",
      message: `Client feedback ${feedback.referenceNumber} has been assigned to you.`,
      db: tx,
    });

    return updatedFeedback;
  });

  return feedbackWithAssignment;
};

// ============================================================
// UPDATE STATUS
// ============================================================

export const updateClientFeedbackStatus = async ({
  feedbackId,
  userId,
  role,
  status,
}) => {
  // 1. Get the feedback
  const feedback = await prisma.clientFeedback.findUnique({
    where: { id: feedbackId },
    select: {
      id: true,
      referenceNumber: true,
      status: true,
      assignedToId: true,
    },
  });

  if (!feedback) {
    throw new Error("Client feedback not found.");
  }

  // 2. Determine the user's role
  const isAdmin = role === "ADMIN" || role === "SYSTEM_ADMINISTRATOR";

  const isAssignedUser =
    (role === "DEPARTMENT_OFFICER" || role === "DEPARTMENT_HEAD") &&
    feedback.assignedToId === userId;

  // 3. Check authorization
  if (!isAdmin && !isAssignedUser) {
    throw new Error("You are not authorized to update this client feedback.");
  }

  // 4. Define allowed status transitions
  const allowedTransitions = {
    PENDING_REVIEW: ["DISMISSED"],
    ASSIGNED: ["IN_REVIEW", "ADDRESSED"],
    IN_REVIEW: ["ADDRESSED"],
  };

  const allowedNextStatuses = allowedTransitions[feedback.status] || [];

  // 5. Check whether the requested transition is allowed
  if (!allowedNextStatuses.includes(status)) {
    throw new Error(
      `Client feedback cannot be changed from ${feedback.status} to ${status}.`,
    );
  }

  // 6. Only Admin/System Admin can dismiss feedback
  if (status === "DISMISSED" && !isAdmin) {
    throw new Error("Only administrators can dismiss client feedback.");
  }

  // 7. Update timestamps based on final status
  const data = {
    status,
  };

  if (status === "ADDRESSED") {
    data.resolvedAt = new Date();
  }

  // 8. Clear closedAt because we do not currently use CLOSED
  data.closedAt = null;

  // 9. Update feedback
  const updatedFeedback = await prisma.clientFeedback.update({
    where: { id: feedbackId },
    data,
    select: {
      id: true,
      referenceNumber: true,
      status: true,
      departmentId: true,
      assignedToId: true,
      assignedById: true,
      resolvedAt: true,
      closedAt: true,
      updatedAt: true,
    },
  });

  // 10. Notify the relevant participants
  if (status === "DISMISSED") {
    // Notify the assigned user if one exists.
    if (feedback.assignedToId) {
      await createNotification({
        userId: feedback.assignedToId,
        feedbackId,
        type: "CLIENT_FEEDBACK_UPDATE",
        channel: "IN_APP",
        title: "Client Feedback Dismissed",
        message: `Client feedback ${feedback.referenceNumber} has been dismissed.`,
      });
    }
  } else if (isAdmin) {
    // Admin/System Admin changed the status.
    // Notify the assigned officer/head.
    if (feedback.assignedToId) {
      await createNotification({
        userId: feedback.assignedToId,
        feedbackId,
        type:
          status === "ADDRESSED"
            ? "CLIENT_FEEDBACK_ADDRESSED"
            : "CLIENT_FEEDBACK_UPDATE",
        channel: "IN_APP",
        title: "Client Feedback Status Updated",
        message: `Client feedback ${feedback.referenceNumber} status changed to ${status}.`,
      });
    }
  } else {
    // Assigned officer/head changed the status.
    // Notify active administrators.
    const administrators = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "SYSTEM_ADMINISTRATOR"],
        },
        status: "ACTIVE",
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    for (const administrator of administrators) {
      await createNotification({
        userId: administrator.id,
        feedbackId,
        type:
          status === "ADDRESSED"
            ? "CLIENT_FEEDBACK_ADDRESSED"
            : "CLIENT_FEEDBACK_UPDATE",
        channel: "IN_APP",
        title: "Client Feedback Status Updated",
        message: `Client feedback ${feedback.referenceNumber} status changed to ${status}.`,
      });
    }
  }

  return updatedFeedback;
};

// ============================================================
// ADD INTERNAL UPDATE
// ============================================================

export const addClientFeedbackUpdate = async ({
  feedbackId,
  userId,
  role,
  message,
}) => {
  // 1. Get the feedback
  const feedback = await prisma.clientFeedback.findUnique({
    where: { id: feedbackId },
    select: {
      id: true,
      referenceNumber: true,
      status: true,
      assignedToId: true,
    },
  });

  if (!feedback) {
    throw new Error("Client feedback not found.");
  }

  // 2. Check whether the user is allowed to add an update
  const isAdmin = role === "ADMIN" || role === "SYSTEM_ADMINISTRATOR";

  const isAssignedUser =
    (role === "DEPARTMENT_OFFICER" || role === "DEPARTMENT_HEAD") &&
    feedback.assignedToId === userId;

  if (!isAdmin && !isAssignedUser) {
    throw new Error(
      "You are not authorized to add an update to this client feedback.",
    );
  }

  // 3. Do not allow updates to dismissed feedback
  if (feedback.status === "DISMISSED") {
    throw new Error("Dismissed client feedback cannot receive updates.");
  }

  // 4. Create the internal update
  const update = await prisma.clientFeedbackUpdate.create({
    data: {
      feedbackId,
      userId,
      message: message.trim(),
    },
    select: {
      id: true,
      feedbackId: true,
      message: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });

  // 5. Notify the other participant(s)
  if (isAdmin) {
    // Admin/System Admin added an update.
    // Notify the assigned officer/head.
    if (feedback.assignedToId) {
      await createNotification({
        userId: feedback.assignedToId,
        feedbackId,
        type: "CLIENT_FEEDBACK_UPDATE",
        channel: "IN_APP",
        title: "Client Feedback Updated",
        message: `A new internal update was added to client feedback ${feedback.referenceNumber}.`,
      });
    }
  } else {
    // Assigned officer/head added an update.
    // Notify all active administrators.
    const administrators = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "SYSTEM_ADMINISTRATOR"],
        },
        status: "ACTIVE",
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    for (const administrator of administrators) {
      await createNotification({
        userId: administrator.id,
        feedbackId,
        type: "CLIENT_FEEDBACK_UPDATE",
        channel: "IN_APP",
        title: "Client Feedback Updated",
        message: `A new internal update was added to client feedback ${feedback.referenceNumber}.`,
      });
    }
  }

  return update;
};
