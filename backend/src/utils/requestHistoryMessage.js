function getUserFullName(user) {
  if (!user) {
    return "Unknown user";
  }

  return `${user.firstName} ${user.lastName}`.trim();
}

function getRequestHistoryMessage(history, viewer) {
  const actorName = getUserFullName(history.actor);
  const isActor = history.actorId === viewer.id;

  // ---------------------------------------------------------
  // Status changes
  // ---------------------------------------------------------

  if (history.action === "STATUS_CHANGED") {
    // ASSIGNED → IN_PROGRESS
    if (history.oldValue === "ASSIGNED" && history.newValue === "IN_PROGRESS") {
      if (isActor) {
        return "You started working on this request.";
      }

      if (viewer.role === "EMPLOYEE") {
        return `${actorName} started working on your request.`;
      }

      return `${actorName} started working on the request.`;
    }

    // IN_PROGRESS → PENDING_EMPLOYEE
    if (
      history.oldValue === "IN_PROGRESS" &&
      history.newValue === "PENDING_EMPLOYEE"
    ) {
      if (isActor) {
        return "You submitted a resolution for employee confirmation.";
      }

      if (viewer.role === "EMPLOYEE") {
        return `${actorName} submitted a resolution for your confirmation.`;
      }

      return `${actorName} submitted a resolution for employee confirmation.`;
    }

    // ESCALATED → IN_PROGRESS
    // Department Head accepted an escalation.
    if (
      history.oldValue === "ESCALATED" &&
      history.newValue === "IN_PROGRESS"
    ) {
      if (isActor) {
        return "You accepted the escalation and started working on the request.";
      }

      if (viewer.role === "EMPLOYEE") {
        return `${actorName} accepted the escalation and started working on your request.`;
      }

      return `${actorName} accepted the escalation and started working on the request.`;
    }

    return `${actorName} changed the request status.`;
  }

  // ---------------------------------------------------------
  // Request reopened
  // ---------------------------------------------------------

  if (history.action === "REOPENED") {
    if (isActor) {
      return "You rejected the resolution and reopened the request.";
    }

    if (viewer.role === "EMPLOYEE") {
      return "You rejected the resolution and reopened the request.";
    }

    return `${actorName} reopened the request after the resolution was rejected.`;
  }

  // ---------------------------------------------------------
  // Request closed
  // ---------------------------------------------------------

  if (history.action === "CLOSED") {
    if (isActor) {
      return "You confirmed the resolution and closed the request.";
    }

    if (viewer.role === "EMPLOYEE") {
      return "You confirmed the resolution and closed the request.";
    }

    return `${actorName} confirmed the resolution and closed the request.`;
  }

  // ---------------------------------------------------------
  // Request assigned
  // ---------------------------------------------------------

  if (history.action === "ASSIGNED") {
    if (!history.actorId) {
      return "The request was automatically assigned.";
    }

    if (isActor) {
      return "You updated the request assignment.";
    }

    if (viewer.role === "EMPLOYEE") {
      return `${actorName} updated the assignment for your request.`;
    }

    return `${actorName} updated the request assignment.`;
  }

  // ---------------------------------------------------------
  // Request escalated
  // ---------------------------------------------------------

  if (history.action === "ESCALATED") {
    if (isActor) {
      return "You escalated the request.";
    }

    if (viewer.role === "EMPLOYEE") {
      return `${actorName} escalated your request.`;
    }

    return `${actorName} escalated the request.`;
  }

  // ---------------------------------------------------------
  // Request created
  // ---------------------------------------------------------

  if (history.action === "CREATED") {
    if (isActor) {
      return "You created this request.";
    }

    if (viewer.role === "EMPLOYEE") {
      return "You created this request.";
    }

    return `${actorName} created the request.`;
  }

  // ---------------------------------------------------------
  // Fallback
  // ---------------------------------------------------------

  return history.description || "Request activity was recorded.";
}

export { getRequestHistoryMessage };
