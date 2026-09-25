import prisma from "../config/database.js";

// ============================================================
// REPORTS SERVICE
// ============================================================

function resolveDateRange(startDate, endDate) {
  const end = endDate ? new Date(endDate) : new Date();

  // Include the entire end day.
  end.setHours(23, 59, 59, 999);

  const start = startDate
    ? new Date(startDate)
    : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  start.setHours(0, 0, 0, 0);

  return { start, end };
}

export const getOverviewReport = async (startDate, endDate) => {
  const { start, end } = resolveDateRange(startDate, endDate);

  const dateFilter = {
    submittedAt: {
      gte: start,
      lte: end,
    },
  };

  // ==========================================================
  // 1. SUMMARY COUNTS
  // ==========================================================

  const [totalRequests, openRequests, resolvedRequests, escalatedRequests] =
    await Promise.all([
      prisma.request.count({ where: dateFilter }),

      prisma.request.count({
        where: {
          ...dateFilter,
          status: {
            in: [
              "OPEN",
              "ASSIGNED",
              "IN_PROGRESS",
              "PENDING_EMPLOYEE",
              "PENDING_INFORMATION",
            ],
          },
        },
      }),

      prisma.request.count({
        where: {
          ...dateFilter,
          status: { in: ["RESOLVED", "CLOSED"] },
        },
      }),

      prisma.request.count({
        where: {
          ...dateFilter,
          status: "ESCALATED",
        },
      }),
    ]);

  // ==========================================================
  // 2. SLA METRICS
  // ==========================================================

  const requestSlas = await prisma.requestSla.findMany({
    where: {
      request: dateFilter,
    },
    select: {
      responseBreached: true,
      resolutionBreached: true,
      startedAt: true,
      responseDueAt: true,
      resolutionDueAt: true,
      request: {
        select: {
          firstResponseAt: true,
          resolvedAt: true,
          submittedAt: true,
          status: true,
        },
      },
    },
  });

  const evaluatedSlas = requestSlas.filter((sla) =>
    ["RESOLVED", "CLOSED"].includes(sla.request.status),
  );

  const totalEvaluated = evaluatedSlas.length;

  const resolutionBreachedCount = evaluatedSlas.filter(
    (sla) => sla.resolutionBreached,
  ).length;

  const responseBreachedCount = requestSlas.filter(
    (sla) => sla.responseBreached,
  ).length;

  const slaComplianceRate =
    totalEvaluated === 0
      ? null
      : Number(
          (
            ((totalEvaluated - resolutionBreachedCount) / totalEvaluated) *
            100
          ).toFixed(1),
        );

  // Average response time (minutes between submittedAt and firstResponseAt)
  const responseTimes = requestSlas
    .filter((sla) => sla.request.firstResponseAt)
    .map(
      (sla) =>
        (new Date(sla.request.firstResponseAt) -
          new Date(sla.request.submittedAt)) /
        60000,
    );

  const avgResponseMinutes =
    responseTimes.length === 0
      ? null
      : Math.round(
          responseTimes.reduce((sum, value) => sum + value, 0) /
            responseTimes.length,
        );

  // Average resolution time (minutes between submittedAt and resolvedAt)
  const resolutionTimes = requestSlas
    .filter((sla) => sla.request.resolvedAt)
    .map(
      (sla) =>
        (new Date(sla.request.resolvedAt) - new Date(sla.request.submittedAt)) /
        60000,
    );

  const avgResolutionMinutes =
    resolutionTimes.length === 0
      ? null
      : Math.round(
          resolutionTimes.reduce((sum, value) => sum + value, 0) /
            resolutionTimes.length,
        );

  // ==========================================================
  // 3. RATINGS
  // ==========================================================

  const ratings = await prisma.requestRating.findMany({
    where: {
      request: dateFilter,
    },
    select: {
      rating: true,
    },
  });

  const avgRating =
    ratings.length === 0
      ? null
      : Number(
          (
            ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          ).toFixed(1),
        );

  // ==========================================================
  // 4. REQUESTS OVER TIME (grouped by day)
  // ==========================================================

  const requestsInRange = await prisma.request.findMany({
    where: dateFilter,
    select: {
      submittedAt: true,
      status: true,
      priority: true,
      department: {
        select: { name: true },
      },
    },
  });

  const requestsByDateMap = {};

  requestsInRange.forEach((request) => {
    const dateKey = request.submittedAt.toISOString().slice(0, 10);
    requestsByDateMap[dateKey] = (requestsByDateMap[dateKey] || 0) + 1;
  });

  const requestsOverTime = Object.entries(requestsByDateMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // ==========================================================
  // 5. BREAKDOWNS (status, priority, department)
  // ==========================================================

  function groupBy(items, keyFn) {
    const map = {};

    items.forEach((item) => {
      const key = keyFn(item);
      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map).map(([key, count]) => ({ key, count }));
  }

  const requestsByStatus = groupBy(
    requestsInRange,
    (request) => request.status,
  ).map(({ key, count }) => ({ status: key, count }));

  const requestsByPriority = groupBy(
    requestsInRange,
    (request) => request.priority,
  ).map(({ key, count }) => ({ priority: key, count }));

  const requestsByDepartment = groupBy(
    requestsInRange,
    (request) => request.department?.name || "Unassigned",
  ).map(({ key, count }) => ({ department: key, count }));

  // ==========================================================
  // 6. PER-OFFICER STATS
  // ==========================================================

  const officerAssignments = await prisma.request.findMany({
    where: {
      ...dateFilter,
      assigneeId: { not: null },
    },
    select: {
      assigneeId: true,
      status: true,
      submittedAt: true,
      resolvedAt: true,
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          department: { select: { name: true } },
        },
      },
      rating: {
        select: { rating: true },
      },
    },
  });

  const officerMap = {};

  officerAssignments.forEach((request) => {
    const officerId = request.assigneeId;

    if (!officerMap[officerId]) {
      officerMap[officerId] = {
        officerId,
        officerName: `${request.assignee.firstName} ${request.assignee.lastName}`,
        department: request.assignee.department?.name || "—",
        assignedCount: 0,
        resolvedCount: 0,
        resolutionTimes: [],
        ratings: [],
      };
    }

    const officer = officerMap[officerId];

    officer.assignedCount += 1;

    if (["RESOLVED", "CLOSED"].includes(request.status)) {
      officer.resolvedCount += 1;
    }

    if (request.resolvedAt) {
      officer.resolutionTimes.push(
        (new Date(request.resolvedAt) - new Date(request.submittedAt)) / 60000,
      );
    }

    if (request.rating) {
      officer.ratings.push(request.rating.rating);
    }
  });

  const officerStats = Object.values(officerMap).map((officer) => ({
    officerId: officer.officerId,
    officerName: officer.officerName,
    department: officer.department,
    assignedCount: officer.assignedCount,
    resolvedCount: officer.resolvedCount,
    avgResolutionMinutes:
      officer.resolutionTimes.length === 0
        ? null
        : Math.round(
            officer.resolutionTimes.reduce((sum, v) => sum + v, 0) /
              officer.resolutionTimes.length,
          ),
    avgRating:
      officer.ratings.length === 0
        ? null
        : Number(
            (
              officer.ratings.reduce((sum, v) => sum + v, 0) /
              officer.ratings.length
            ).toFixed(1),
          ),
  }));

  officerStats.sort((a, b) => b.assignedCount - a.assignedCount);

  // ==========================================================
  // 7. RETURN
  // ==========================================================

  return {
    summary: {
      totalRequests,
      openRequests,
      resolvedRequests,
      escalatedRequests,
      slaComplianceRate,
      avgResponseMinutes,
      avgResolutionMinutes,
      avgRating,
    },
    requestsOverTime,
    requestsByStatus,
    requestsByPriority,
    requestsByDepartment,
    slaBreaches: {
      responseBreached: responseBreachedCount,
      resolutionBreached: resolutionBreachedCount,
      totalEvaluated,
    },
    officerStats,
  };
};
