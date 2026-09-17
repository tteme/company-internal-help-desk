import prisma from "../config/database.js";
import { createNotification } from "./notification.service.js";

/**
 * Process an SLA warning.
 *
 * The warning is sent once only.
 *
 * Warning does NOT reassign the request.
 */
const processSlaWarning = async (sla) => {
  return prisma.$transaction(async (tx) => {
    // ---------------------------------------------------------
    // 1. Load the request first
    // ---------------------------------------------------------

    const request = await tx.request.findUnique({
      where: {
        id: sla.requestId,
      },

      select: {
        id: true,
        ticketNumber: true,
        title: true,
        status: true,
        assigneeId: true,
      },
    });

    if (!request) {
      return {
        processed: false,
        reason: "REQUEST_NOT_FOUND",
      };
    }

    // ---------------------------------------------------------
    // 2. Do not send warning for terminal requests
    // ---------------------------------------------------------

    if (["RESOLVED", "CLOSED", "REJECTED"].includes(request.status)) {
      return {
        processed: false,
        reason: "REQUEST_TERMINAL",
      };
    }

    // ---------------------------------------------------------
    // 3. There must be a current assignee
    // ---------------------------------------------------------

    if (!request.assigneeId) {
      return {
        processed: false,
        reason: "NO_ASSIGNEE",
      };
    }

    // ---------------------------------------------------------
    // 4. Atomically claim the warning
    // ---------------------------------------------------------

    const warningSentAt = new Date();

    const claimed = await tx.requestSla.updateMany({
      where: {
        id: sla.id,
        warningSentAt: null,
        resolutionBreached: false,
        warningAt: {
          lte: warningSentAt,
        },
      },

      data: {
        warningSentAt,
      },
    });

    if (claimed.count !== 1) {
      return {
        processed: false,
        reason: "WARNING_ALREADY_PROCESSED",
      };
    }

    // ---------------------------------------------------------
    // 5. Create warning notification
    // ---------------------------------------------------------

    await createNotification({
      db: tx,
      userId: request.assigneeId,
      requestId: request.id,
      type: "SLA_WARNING",
      title: "SLA Warning",
      message:
        `Request ${request.ticketNumber} is approaching its ` +
        `resolution SLA deadline. Please prioritize this request.`,
    });

    // ---------------------------------------------------------
    // 6. Return result
    // ---------------------------------------------------------

    return {
      processed: true,
      requestId: request.id,
      ticketNumber: request.ticketNumber,
    };
  });
};

/**
 * Automatically escalate a request because its resolution SLA
 * has been breached.
 *
 * Important:
 * - The officer does NOT need to have viewed the request.
 * - The request can be ASSIGNED or IN_PROGRESS.
 * - If it has already been manually escalated, we do not create
 *   another escalation/assignment.
 */
const processSlaBreach = async (sla) => {
  return prisma.$transaction(async (tx) => {
    // ---------------------------------------------------------
    // 1. Load the request
    // ---------------------------------------------------------

    const request = await tx.request.findUnique({
      where: {
        id: sla.requestId,
      },

      include: {
        department: true,

        assignee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },

        escalations: {
          where: {
            status: "PENDING",
          },

          orderBy: {
            escalatedAt: "desc",
          },

          take: 1,
        },
      },
    });

    if (!request) {
      return {
        processed: false,
        reason: "REQUEST_NOT_FOUND",
      };
    }

    // ---------------------------------------------------------
    // 2. Ignore terminal requests
    // ---------------------------------------------------------

    if (["RESOLVED", "CLOSED", "REJECTED"].includes(request.status)) {
      return {
        processed: false,
        reason: "REQUEST_TERMINAL",
      };
    }

    // ---------------------------------------------------------
    // 3. Find Department Head
    // ---------------------------------------------------------

    const departmentHead = await tx.user.findFirst({
      where: {
        role: "DEPARTMENT_HEAD",
        status: "ACTIVE",
        isActive: true,
        departmentId: request.departmentId,
      },

      orderBy: {
        createdAt: "asc",
      },

      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        departmentId: true,
      },
    });

    if (!departmentHead) {
      console.error(
        `⚠️ SLA breach detected for ${request.ticketNumber}, ` +
          `but no active Department Head exists.`,
      );

      return {
        processed: false,
        reason: "NO_DEPARTMENT_HEAD",
      };
    }

    // ---------------------------------------------------------
    // 4. Atomically claim SLA breach
    // ---------------------------------------------------------

    const breachTime = new Date();

    const claimed = await tx.requestSla.updateMany({
      where: {
        id: sla.id,
        resolutionBreached: false,
        resolutionDueAt: {
          lte: breachTime,
        },
      },

      data: {
        resolutionBreached: true,
        resolutionBreachedAt: breachTime,
      },
    });

    if (claimed.count !== 1) {
      return {
        processed: false,
        reason: "BREACH_ALREADY_PROCESSED",
      };
    }

    // ---------------------------------------------------------
    // 5. If request is already with Department Head
    // ---------------------------------------------------------

    if (request.assignee?.role === "DEPARTMENT_HEAD") {
      await createNotification({
        db: tx,
        userId: request.assignee.id,
        requestId: request.id,
        type: "SLA_BREACHED",
        title: "SLA Breached",
        message:
          `Request ${request.ticketNumber} has breached its ` +
          `resolution SLA while already assigned to you.`,
      });

      await tx.requestHistory.create({
        data: {
          requestId: request.id,
          actorId: null,
          action: "ESCALATED",
          oldValue: request.status,
          newValue: request.status,
          description:
            `Resolution SLA breached for request ${request.ticketNumber}. ` +
            `The request was already assigned to a Department Head, ` +
            `so no duplicate escalation or assignment was created.`,
        },
      });

      return {
        processed: true,
        alreadyEscalated: true,
        requestId: request.id,
        ticketNumber: request.ticketNumber,
      };
    }

    // ---------------------------------------------------------
    // 6. If another escalation is already pending
    // ---------------------------------------------------------

    if (request.escalations.length > 0) {
      const existingEscalation = request.escalations[0];

      if (existingEscalation.escalatedToId) {
        await createNotification({
          db: tx,
          userId: existingEscalation.escalatedToId,
          requestId: request.id,
          type: "SLA_BREACHED",
          title: "SLA Breached",
          message:
            `Request ${request.ticketNumber} has breached its ` +
            `resolution SLA while escalated to you.`,
        });
      }

      await tx.requestHistory.create({
        data: {
          requestId: request.id,
          actorId: null,
          action: "ESCALATED",
          oldValue: request.status,
          newValue: request.status,
          description:
            `Resolution SLA breached for request ${request.ticketNumber}. ` +
            `The request already had a pending escalation, so no duplicate ` +
            `Department Head assignment was created.`,
        },
      });

      return {
        processed: true,
        alreadyEscalated: true,
        requestId: request.id,
        ticketNumber: request.ticketNumber,
      };
    }

    // ---------------------------------------------------------
    // 7. Determine previous assignee
    // ---------------------------------------------------------

    const previousAssigneeId = request.assigneeId;

    // ---------------------------------------------------------
    // 7.1. Close current officer assignment
    // ---------------------------------------------------------

    if (previousAssigneeId) {
      await tx.requestAssignment.updateMany({
        where: {
          requestId: request.id,
          assignedTo: previousAssigneeId,
          unassignedAt: null,
        },

        data: {
          unassignedAt: breachTime,
        },
      });
    }

    // ---------------------------------------------------------
    // 8. Create Department Head assignment
    // ---------------------------------------------------------

    const headAssignment = await tx.requestAssignment.create({
      data: {
        requestId: request.id,
        assignedTo: departmentHead.id,
        assignedById: null,
        assignmentType: "ESCALATION",
        assignedAt: breachTime,
      },
    });

    // ---------------------------------------------------------
    // 9. Create SLA breach escalation
    // ---------------------------------------------------------

    const escalation = await tx.requestEscalation.create({
      data: {
        requestId: request.id,
        escalatedFromId: previousAssigneeId || null,
        escalatedToId: departmentHead.id,
        reason: "SLA_BREACH",
        status: "PENDING",

        description:
          `Automatically escalated because the resolution SLA ` +
          `was breached at ${breachTime.toISOString()}.`,

        escalatedAt: breachTime,
      },
    });

    // ---------------------------------------------------------
    // 10. Transfer request to Department Head
    // ---------------------------------------------------------

    const updatedRequest = await tx.request.update({
      where: {
        id: request.id,
      },

      data: {
        assigneeId: departmentHead.id,
        status: "ESCALATED",
      },
    });

    // ---------------------------------------------------------
    // 11. Assignment history
    // ---------------------------------------------------------

    await tx.requestHistory.create({
      data: {
        requestId: request.id,
        actorId: null,
        action: "ASSIGNED",
        oldValue: previousAssigneeId || null,
        newValue: departmentHead.id,
        description:
          `Request automatically assigned to Department Head ` +
          `${departmentHead.firstName} ${departmentHead.lastName} ` +
          `because the resolution SLA was breached.`,
      },
    });

    // ---------------------------------------------------------
    // 12. Escalation history
    // ---------------------------------------------------------

    await tx.requestHistory.create({
      data: {
        requestId: request.id,
        actorId: null,
        action: "ESCALATED",
        oldValue: request.status,
        newValue: "ESCALATED",
        description:
          `Request automatically escalated to Department Head ` +
          `${departmentHead.firstName} ${departmentHead.lastName} ` +
          `because the resolution SLA was breached.`,
      },
    });

    // ---------------------------------------------------------
    // 13. Notify Department Head
    // ---------------------------------------------------------

    await createNotification({
      db: tx,
      userId: departmentHead.id,
      requestId: request.id,
      type: "SLA_BREACHED",
      title: "SLA Breached — Request Escalated",
      message:
        `Request ${request.ticketNumber} has breached its ` +
        `resolution SLA and has been automatically escalated to you.`,
    });

    // ---------------------------------------------------------
    // 14. Return result
    // ---------------------------------------------------------

    return {
      processed: true,
      alreadyEscalated: false,
      request: updatedRequest,
      escalation,
      assignment: headAssignment,
      departmentHead,
    };
  });
};

/**
 * Find and process SLA warnings.
 */
export const processSlaWarnings = async () => {
  const now = new Date();

  const overdueWarnings = await prisma.requestSla.findMany({
    where: {
      warningAt: {
        not: null,
        lte: now,
      },

      warningSentAt: null,

      resolutionBreached: false,

      request: {
        status: {
          notIn: ["RESOLVED", "CLOSED", "REJECTED"],
        },
      },
    },

    select: {
      id: true,
      requestId: true,
      warningAt: true,
    },
  });

  for (const sla of overdueWarnings) {
    try {
      await processSlaWarning(sla);
    } catch (error) {
      console.error(
        `❌ Failed to process SLA warning for ${sla.requestId}:`,
        error,
      );
    }
  }

  return overdueWarnings.length;
};

/**
 * Find and process SLA breaches.
 */
export const processSlaBreaches = async () => {
  const now = new Date();

  const breachedSlas = await prisma.requestSla.findMany({
    where: {
      resolutionDueAt: {
        lte: now,
      },

      resolutionBreached: false,

      request: {
        status: {
          notIn: ["RESOLVED", "CLOSED", "REJECTED"],
        },
      },
    },

    select: {
      id: true,
      requestId: true,
      resolutionDueAt: true,
    },
  });

  for (const sla of breachedSlas) {
    try {
      await processSlaBreach(sla);
    } catch (error) {
      console.error(
        `❌ Failed to process SLA breach for ${sla.requestId}:`,
        error,
      );
    }
  }

  return breachedSlas.length;
};

/**
 * Run the complete SLA monitoring cycle.
 */
export const runSlaMonitor = async () => {
  console.log("⏱️ Running SLA monitor...");

  const warningCount = await processSlaWarnings();

  const breachCount = await processSlaBreaches();

  console.log(
    `✅ SLA monitor completed. ` +
      `Warnings checked: ${warningCount}, ` +
      `Breaches checked: ${breachCount}`,
  );
};
