import crypto from "crypto";
import prisma from "../config/database.js";
import { calculateResolutionSla } from "./sla-calculator.service.js";

/**
 * Determine the request category from the title and description.
 *
 * Longer keywords are checked first so specific phrases such as
 * "salary deduction" take priority over shorter keywords such as "salary".
 *
 * Overlapping keyword matches are counted only once.
 */
const findCategoryFromDescription = async ({ title, description }) => {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      department: {
        isActive: true,
      },
      keywords: {
        some: {
          isActive: true,
        },
      },
    },
    include: {
      department: true,
      keywords: {
        where: {
          isActive: true,
        },
        select: {
          keyword: true,
          weight: true,
        },
      },
    },
  });

  if (categories.length === 0) {
    throw new Error(
      "No active request categories with keywords are configured.",
    );
  }

  const text = `${title} ${description}`.toLowerCase();

  let bestCategory = null;
  let bestScore = 0;

  for (const category of categories) {
    let score = 0;

    // Check longer keywords first.
    const sortedKeywords = [...category.keywords].sort(
      (a, b) => b.keyword.length - a.keyword.length,
    );

    const matchedRanges = [];

    for (const keyword of sortedKeywords) {
      const keywordText = keyword.keyword.toLowerCase().trim();

      if (!keywordText) {
        continue;
      }

      let startIndex = text.indexOf(keywordText);

      while (startIndex !== -1) {
        const endIndex = startIndex + keywordText.length;

        const overlaps = matchedRanges.some(
          (range) => startIndex < range.end && endIndex > range.start,
        );

        if (!overlaps) {
          score += keyword.weight;

          matchedRanges.push({
            start: startIndex,
            end: endIndex,
          });
        }

        startIndex = text.indexOf(keywordText, startIndex + 1);
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  if (!bestCategory || bestScore === 0) {
    throw new Error(
      "The system could not determine the appropriate request category. Please provide more details about the problem.",
    );
  }

  console.log(
    `📌 Request classified as "${bestCategory.name}" with score ${bestScore}`,
  );

  return {
    category: bestCategory,
    score: bestScore,
  };
};

/**
 * Generate a unique ticket number.
 *
 */
const generateTicketNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `HD-${date}-${randomPart}`;
};

/**
 * Find the currently available officer with the lowest workload.
 *
 * Only active/non-terminal requests count toward workload.
 *
 * Terminal statuses:
 * - RESOLVED
 * - CLOSED
 * - REJECTED
 */
const findAvailableOfficer = async (departmentId) => {
  const officers = await prisma.user.findMany({
    where: {
      departmentId,
      role: "DEPARTMENT_OFFICER",
      status: "ACTIVE",
      isActive: true,
      availability: "AVAILABLE",
    },
    include: {
      _count: {
        select: {
          assignmentsReceived: {
            where: {
              unassignedAt: null,
              request: {
                status: {
                  notIn: ["RESOLVED", "CLOSED", "REJECTED"],
                },
              },
            },
          },
        },
      },
    },
  });

  if (officers.length === 0) {
    return null;
  }

  officers.sort(
    (a, b) => a._count.assignmentsReceived - b._count.assignmentsReceived,
  );

  return officers[0];
};

/**
 * Create and automatically assign a request.
 *
 */
export const createRequest = async ({ creatorId, title, description }) => {
  const classification = await findCategoryFromDescription({
    title,
    description,
  });

  const { category } = classification;
  const { department } = category;

  // Automatic priority detection is intentionally deferred.
  const priority = "MEDIUM";

  const officer = await findAvailableOfficer(department.id);

  if (!officer) {
    throw new Error(
      "No available department officer is currently available to handle this request.",
    );
  }

  const slaPolicy = await prisma.slaPolicy.findUnique({
    where: {
      departmentId_priority: {
        departmentId: department.id,
        priority,
      },
    },
  });

  if (!slaPolicy || !slaPolicy.isActive) {
    throw new Error(
      "No active SLA policy is configured for this department and priority.",
    );
  }

  const submittedAt = new Date();
  const assignedAt = submittedAt;

  const { warningAt, resolutionDueAt } = await calculateResolutionSla({
    startedAt: assignedAt,
    resolutionTimeMinutes: slaPolicy.resolutionTimeMinutes,
    warningPercentage: slaPolicy.warningPercentage,
  });

  const ticketNumber = generateTicketNumber();

  return prisma.$transaction(async (tx) => {
    const request = await tx.request.create({
      data: {
        ticketNumber,
        title,
        description,
        priority,
        status: "ASSIGNED",
        channel: "WEB",

        creatorId,
        departmentId: department.id,
        categoryId: category.id,

        assigneeId: officer.id,
        assignedAt: submittedAt,
        submittedAt,

        sla: {
          create: {
            slaPolicyId: slaPolicy.id,
            startedAt: assignedAt,
            resolutionDueAt,
            warningAt,
          },
        },

        assignments: {
          create: {
            assignedTo: officer.id,
            assignmentType: "AUTOMATIC",
            assignedAt,
          },
        },

        histories: {
          create: {
            actorId: creatorId,
            action: "CREATED",
            description: `Request created by employee. Category automatically determined as "${category.name}" and routed to "${department.name}".`,
          },
        },
      },

      include: {
        category: true,
        department: true,

        assignee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },

        sla: {
          include: {
            slaPolicy: true,
          },
        },
      },
    });

    await tx.requestHistory.create({
      data: {
        requestId: request.id,
        actorId: null,
        action: "ASSIGNED",
        description: `Request automatically assigned to ${officer.firstName} ${officer.lastName}.`,
      },
    });

    return request;
  });
};

/**
 * Get all requests currently assigned to an officer.
 */
export const getOfficerRequests = async (officerId) => {
  return prisma.request.findMany({
    where: {
      assigneeId: officerId,
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      category: true,
      department: true,

      creator: {
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          email: true,
          branch: true,
        },
      },

      sla: {
        include: {
          slaPolicy: true,
        },
      },
    },
  });
};

/**
 * Get a single request by ID.
 *
 * Access is allowed for:
 * - The employee who created the request
 * - The Department Officer currently assigned to the request
 * - The Department Head currently assigned to the request
 *
 * Department Head escalation behavior:
 * - Head views the escalated request
 * - PENDING escalation becomes ACCEPTED
 * - Request ESCALATED becomes IN_PROGRESS
 * - Head remains assigned
 * - Head assignment.firstViewedAt is recorded
 */
export const getRequestById = async ({
  requestId,
  userId,
  userRole,
}) => {
  const request = await prisma.request.findUnique({
    where: {
      id: requestId,
    },

    include: {
      category: true,

      department: true,

      creator: {
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          branch: true,
        },
      },

      assignee: {
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          email: true,
          availability: true,
          role: true,
        },
      },

      sla: {
        include: {
          slaPolicy: true,
        },
      },

      comments: {
        orderBy: {
          createdAt: "asc",
        },

        include: {
          author: {
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

      assignments: {
        orderBy: {
          assignedAt: "desc",
        },

        include: {
          assignee: {
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

      histories: {
        orderBy: {
          createdAt: "asc",
        },

        include: {
          actor: {
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

      escalations: {
        orderBy: {
          escalatedAt: "desc",
        },

        include: {
          fromUser: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },

          toUser: {
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

  if (!request) {
    throw new Error("Request not found.");
  }

  // ---------------------------------------------------------
  // 1. Authorization
  // ---------------------------------------------------------

  const isRequestCreator =
    request.creatorId === userId;

  const isCurrentOfficer =
    userRole === "DEPARTMENT_OFFICER" &&
    request.assigneeId === userId;

  const isCurrentHead =
    userRole === "DEPARTMENT_HEAD" &&
    request.assigneeId === userId;

  const pendingEscalation =
    request.escalations.find(
      (escalation) =>
        escalation.escalatedToId === userId &&
        escalation.status === "PENDING"
    );

  const isPendingEscalationHead =
    userRole === "DEPARTMENT_HEAD" &&
    pendingEscalation !== undefined;

  const isAuthorized =
    isRequestCreator ||
    isCurrentOfficer ||
    isCurrentHead ||
    isPendingEscalationHead;

  if (!isAuthorized) {
    throw new Error(
      "You are not authorized to view this request."
    );
  }

  // ---------------------------------------------------------
  // 2. Find this user's current assignment
  // ---------------------------------------------------------

  let currentAssignment =
    request.assignments.find(
      (assignment) =>
        assignment.assignedTo === userId &&
        assignment.unassignedAt === null
    );

  // ---------------------------------------------------------
  // 3. Department Head views pending escalation
  // ---------------------------------------------------------

  if (isPendingEscalationHead) {
    // The Head must already be the current assignee.
    if (request.assigneeId !== userId) {
      throw new Error(
        "You are not the current assignee of this escalated request."
      );
    }

    // Verify that the user is an active Department Head
    // in the same department.
    const departmentHead =
      await prisma.user.findFirst({
        where: {
          id: userId,
          role: "DEPARTMENT_HEAD",
          status: "ACTIVE",
          isActive: true,
          departmentId: request.departmentId,
        },

        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });

    if (!departmentHead) {
      throw new Error(
        "Only an active Department Head from this department can accept this escalation."
      );
    }

    // The Head should already have an active assignment.
    if (!currentAssignment) {
      throw new Error(
        "Current Department Head assignment could not be found."
      );
    }

    const firstViewedAt = new Date();

    const result = await prisma.$transaction(
      async (transaction) => {
        // ---------------------------------------------------
        // Change request status
        // ESCALATED → IN_PROGRESS
        // ---------------------------------------------------

        const updatedRequest =
          await transaction.request.update({
            where: {
              id: request.id,
            },

            data: {
              status: "IN_PROGRESS",
            },
          });

        // ---------------------------------------------------
        // Accept escalation
        // PENDING → ACCEPTED
        // ---------------------------------------------------

        const updatedEscalation =
          await transaction.requestEscalation.update({
            where: {
              id: pendingEscalation.id,
            },

            data: {
              status: "ACCEPTED",
            },
          });

        // ---------------------------------------------------
        // Record Head's first view
        // ---------------------------------------------------

        const updatedAssignment =
          currentAssignment.firstViewedAt === null
            ? await transaction.requestAssignment.update({
                where: {
                  id: currentAssignment.id,
                },

                data: {
                  firstViewedAt,
                },
              })
            : currentAssignment;

        // ---------------------------------------------------
        // Record history
        // ---------------------------------------------------

        await transaction.requestHistory.create({
          data: {
            requestId: request.id,
            actorId: departmentHead.id,
            action: "STATUS_CHANGED",
            oldValue: "ESCALATED",
            newValue: "IN_PROGRESS",
            description:
              "Department Head viewed the escalated request and accepted responsibility.",
          },
        });

        return {
          updatedRequest,
          updatedEscalation,
          updatedAssignment,
        };
      }
    );

    // -------------------------------------------------------
    // Update returned request object
    // -------------------------------------------------------

    request.status =
      result.updatedRequest.status;

    pendingEscalation.status =
      result.updatedEscalation.status;

    currentAssignment.firstViewedAt =
      result.updatedAssignment.firstViewedAt;

    return request;
  }

  // ---------------------------------------------------------
  // 4. Normal current-assignee first view
  //
  // Applies to:
  // - Department Officer
  // - Department Head
  //
  // Employee viewing their own request does not create
  // an assignment firstViewedAt.
  // ---------------------------------------------------------

  const isSupportAssignee =
    isCurrentOfficer || isCurrentHead;

  if (
    isSupportAssignee &&
    currentAssignment &&
    currentAssignment.firstViewedAt === null
  ) {
    const firstViewedAt = new Date();

    const updatedAssignment =
      await prisma.requestAssignment.update({
        where: {
          id: currentAssignment.id,
        },

        data: {
          firstViewedAt,
        },
      });

    currentAssignment.firstViewedAt =
      updatedAssignment.firstViewedAt;
  }

  // ---------------------------------------------------------
  // 5. Return request
  // ---------------------------------------------------------

  return request;
};

/**
 * Start working on a request.
 *
 * ASSIGNED → IN_PROGRESS
 * REOPENED → IN_PROGRESS
 */
export const startRequest = async ({ requestId, officerId }) => {
  const request = await prisma.request.findUnique({
    where: {
      id: requestId,
    },
  });

  if (!request) {
    throw new Error("Request not found.");
  }

  if (request.assigneeId !== officerId) {
    throw new Error("You are not authorized to update this request.");
  }

  if (!["ASSIGNED", "REOPENED"].includes(request.status)) {
    throw new Error(
      `Request cannot be started because its current status is ${request.status}.`,
    );
  }

  return prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.request.update({
      where: {
        id: requestId,
      },

      data: {
        status: "IN_PROGRESS",
      },
    });

    await tx.requestHistory.create({
      data: {
        requestId,
        actorId: officerId,
        action: "STATUS_CHANGED",
        oldValue: request.status,
        newValue: "IN_PROGRESS",
        description: "Department officer started working on the request.",
      },
    });

    return updatedRequest;
  });
};

/**
 * Add a comment to a request.
 *
 * The first comment from the currently assigned
 * Department Officer or Department Head counts
 * as the first response.
 */
export const addRequestComment = async ({ requestId, userId, content }) => {
  const request = await prisma.request.findUnique({
    where: {
      id: requestId,
    },
    include: {
      assignee: {
        select: {
          id: true,
          role: true,
        },
      },
    },
  });

  if (!request) {
    throw new Error("Request not found.");
  }

  const isCreator = request.creatorId === userId;

  const isAssignedSupportUser =
    request.assigneeId === userId &&
    ["DEPARTMENT_OFFICER", "DEPARTMENT_HEAD"].includes(
      request.assignee?.role,
    );

  if (!isCreator && !isAssignedSupportUser) {
    throw new Error("You are not authorized to comment on this request.");
  }

  if (["CLOSED", "REJECTED"].includes(request.status)) {
    throw new Error(
      `Cannot comment on a request with status ${request.status}.`,
    );
  }

  return prisma.$transaction(async (tx) => {
    const comment = await tx.requestComment.create({
      data: {
        requestId,
        authorId: userId,
        message: content,
      },

      include: {
        author: {
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

    await tx.requestHistory.create({
      data: {
        requestId,
        actorId: userId,
        action: "COMMENTED",
        description: "A comment was added to the request.",
      },
    });

    let firstResponseAt = request.firstResponseAt;

    if (isAssignedSupportUser && !request.firstResponseAt) {
      firstResponseAt = new Date();

      await tx.request.update({
        where: {
          id: requestId,
        },

        data: {
          firstResponseAt,
        },
      });
    }

    return {
      comment,
      firstResponseAt,
    };
  });
};
/**
 * Resolve a request.
 *
 * IN_PROGRESS → RESOLVED
 *
 * A request can be resolved by:
 * - The currently assigned Department Officer
 * - The currently assigned Department Head
 */
export const resolveRequest = async ({
  requestId,
  officerId,
  message,
}) => {
  const request = await prisma.request.findUnique({
    where: {
      id: requestId,
    },
    include: {
      assignee: {
        select: {
          id: true,
          role: true,
        },
      },
    },
  });

  if (!request) {
    throw new Error("Request not found.");
  }

  const isAssignedSupportUser =
    request.assigneeId === officerId &&
    ["DEPARTMENT_OFFICER", "DEPARTMENT_HEAD"].includes(
      request.assignee?.role,
    );

  if (!isAssignedSupportUser) {
    throw new Error("You are not authorized to resolve this request.");
  }

  if (request.status !== "IN_PROGRESS") {
    throw new Error(
      `Request cannot be resolved because its current status is ${request.status}.`,
    );
  }

  const resolvedAt = new Date();

  return prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.request.update({
      where: {
        id: requestId,
      },

      data: {
        status: "RESOLVED",
        resolvedAt,
      },
    });

    await tx.requestComment.create({
      data: {
        requestId,
        authorId: officerId,
        message,
        isInternal: false,
      },
    });

    const resolverRole =
      request.assignee.role === "DEPARTMENT_HEAD"
        ? "Department Head"
        : "Department Officer";

    await tx.requestHistory.create({
      data: {
        requestId,
        actorId: officerId,
        action: "RESOLVED",
        oldValue: "IN_PROGRESS",
        newValue: "RESOLVED",
        description: `${resolverRole} resolved the request.`,
      },
    });

    return updatedRequest;
  });
};

/**
 * Employee confirms or rejects an officer's resolution.
 *
 * CONFIRM:
 * RESOLVED → CLOSED
 *
 * REJECT:
 * RESOLVED → REOPENED
 */
export const confirmOrRejectRequest = async ({
  requestId,
  employeeId,
  decision,
  message,
}) => {
  const request = await prisma.request.findUnique({
    where: {
      id: requestId,
    },
  });

  if (!request) {
    throw new Error("Request not found.");
  }

  if (request.creatorId !== employeeId) {
    throw new Error(
      "Only the employee who created the request can confirm or reject the resolution.",
    );
  }

  if (request.status !== "RESOLVED") {
    throw new Error(
      `Request cannot be confirmed or rejected because its current status is ${request.status}.`,
    );
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    if (decision === "CONFIRM") {
      const updatedRequest = await tx.request.update({
        where: {
          id: requestId,
        },

        data: {
          status: "CLOSED",
          closedAt: now,
        },
      });

      await tx.requestHistory.create({
        data: {
          requestId,
          actorId: employeeId,
          action: "CLOSED",
          oldValue: "RESOLVED",
          newValue: "CLOSED",
          description:
            "Employee confirmed the resolution and closed the request.",
        },
      });

      return updatedRequest;
    }

    const updatedRequest = await tx.request.update({
      where: {
        id: requestId,
      },

      data: {
        status: "REOPENED",
        resolvedAt: null,
        closedAt: null,
      },
    });

    await tx.requestComment.create({
      data: {
        requestId,
        authorId: employeeId,
        message,
        isInternal: false,
      },
    });

    await tx.requestHistory.create({
      data: {
        requestId,
        actorId: employeeId,
        action: "REOPENED",
        oldValue: "RESOLVED",
        newValue: "REOPENED",
        description:
          "Employee rejected the resolution and reopened the request.",
      },
    });

    return updatedRequest;
  });
};


/**
 * Escalate a request from a Department Officer to the
 * Department Head of the same department.
 *
 * Business flow:
 *
 * IN_PROGRESS
 *      ↓
 * Officer escalates
 *      ↓
 * ESCALATED
 *      +
 * Immediately assigned to Department Head
 *      +
 * Escalation status = PENDING
 *
 * The Department Head does not need to manually accept
 * the escalation. The first time the Head views the request,
 * getRequestById() will automatically:
 *
 * - Change escalation PENDING → ACCEPTED
 * - Change request ESCALATED → IN_PROGRESS
 */
export const escalateRequest = async ({
  requestId,
  officerId,
  reason,
  description,
}) => {
  // ---------------------------------------------------------
  // 1. Find the request
  // ---------------------------------------------------------

  const request = await prisma.request.findUnique({
    where: {
      id: requestId,
    },
    include: {
      department: true,
      assignee: true,
    },
  });

  if (!request) {
    throw new Error("Request not found.");
  }

  // ---------------------------------------------------------
  // 2. Verify that the officer is the current assignee
  // ---------------------------------------------------------

  if (request.assigneeId !== officerId) {
    throw new Error(
      "Only the officer currently assigned to this request can escalate it.",
    );
  }

  // ---------------------------------------------------------
  // 3. Verify request status
  // ---------------------------------------------------------

  if (request.status !== "IN_PROGRESS") {
    throw new Error(
      "A request must be in progress before it can be manually escalated.",
    );
  }

  // ---------------------------------------------------------
  // 4. Verify the current user is a Department Officer
  // ---------------------------------------------------------

  const departmentOfficer = await prisma.user.findFirst({
    where: {
      id: officerId,
      role: "DEPARTMENT_OFFICER",
      status: "ACTIVE",
      isActive: true,
      departmentId: request.departmentId,
    },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      departmentId: true,
    },
  });

  if (!departmentOfficer) {
    throw new Error(
      "Only an active Department Officer from this department can escalate the request.",
    );
  }

  // ---------------------------------------------------------
  // 5. Find the active Department Head
  // ---------------------------------------------------------

  const departmentHead = await prisma.user.findFirst({
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
    throw new Error(
      `No active Department Head is available for the ${request.department.name} department.`,
    );
  }

  // ---------------------------------------------------------
  // 6. Prevent duplicate pending escalations
  // ---------------------------------------------------------

  const existingPendingEscalation =
    await prisma.requestEscalation.findFirst({
      where: {
        requestId: request.id,
        status: "PENDING",
      },
    });

  if (existingPendingEscalation) {
    throw new Error(
      "This request already has a pending escalation.",
    );
  }

  // ---------------------------------------------------------
  // 7. Perform escalation and assignment transfer
  //    inside one transaction
  // ---------------------------------------------------------

  const escalationCreatedAt = new Date();

  const escalationResult =
    await prisma.$transaction(async (transaction) => {
      // -----------------------------------------------------
      // Close the officer's current assignment
      // -----------------------------------------------------

      await transaction.requestAssignment.updateMany({
        where: {
          requestId: request.id,
          assignedTo: officerId,
          unassignedAt: null,
        },
        data: {
          unassignedAt: escalationCreatedAt,
        },
      });

      // -----------------------------------------------------
      // Create Department Head assignment
      // -----------------------------------------------------

      const departmentHeadAssignment =
        await transaction.requestAssignment.create({
          data: {
            requestId: request.id,
            assignedTo: departmentHead.id,
            assignedById: officerId,
            assignmentType: "ESCALATION",
            assignedAt: escalationCreatedAt,
          },
        });

      // -----------------------------------------------------
      // Create escalation record
      // -----------------------------------------------------

      const requestEscalation =
        await transaction.requestEscalation.create({
          data: {
            requestId: request.id,
            escalatedFromId: officerId,
            escalatedToId: departmentHead.id,
            reason,
            status: "PENDING",
            description: description || null,
            escalatedAt: escalationCreatedAt,
          },
        });

      // -----------------------------------------------------
      // Transfer request assignment to Department Head
      // -----------------------------------------------------

      const updatedRequest = await transaction.request.update({
        where: {
          id: request.id,
        },
        data: {
          assigneeId: departmentHead.id,
          status: "ESCALATED",
        },
      });

      // -----------------------------------------------------
      // Record assignment history
      // -----------------------------------------------------

      await transaction.requestHistory.create({
        data: {
          requestId: request.id,
          actorId: officerId,
          action: "ASSIGNED",
          oldValue: officerId,
          newValue: departmentHead.id,
          description:
            `Request assigned to Department Head ${departmentHead.firstName} ${departmentHead.lastName} as part of escalation.`,
        },
      });

      // -----------------------------------------------------
      // Record escalation history
      // -----------------------------------------------------

      await transaction.requestHistory.create({
        data: {
          requestId: request.id,
          actorId: officerId,
          action: "ESCALATED",
          oldValue: "IN_PROGRESS",
          newValue: "ESCALATED",
          description:
            `Request escalated to ${departmentHead.firstName} ${departmentHead.lastName}. Reason: ${reason}.`,
        },
      });

      return {
        updatedRequest,
        requestEscalation,
        departmentHeadAssignment,
      };
    });

  // ---------------------------------------------------------
  // 8. Return useful information
  // ---------------------------------------------------------

  return {
    request: escalationResult.updatedRequest,

    escalation: escalationResult.requestEscalation,

    assignment: escalationResult.departmentHeadAssignment,

    departmentHead: {
      id: departmentHead.id,
      employeeId: departmentHead.employeeId,
      firstName: departmentHead.firstName,
      lastName: departmentHead.lastName,
      email: departmentHead.email,
    },
  };
};