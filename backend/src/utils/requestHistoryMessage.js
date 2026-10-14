function getUserFullName(user) {
  if (!user) {
    return "Unknown user";
  }

  return `${user.firstName} ${user.lastName}`.trim();
}

/**
 * Build the human-readable sentence for an activity history row.
 *
 * userNames maps user IDs to full names. It is used for ASSIGNED rows,
 * which store user IDs in oldValue/newValue.
 */
function getRequestHistoryMessage(history, viewer, userNames = {}) {
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
    // Automatic assignment: the stored description already
    // names the officer ("Request automatically assigned to ...").
    if (!history.actorId) {
      return history.description || "The request was automatically assigned.";
    }

    const assigneeName = history.newValue ? userNames[history.newValue] : null;

    // Names unavailable: fall back to the generic wording.
    if (!assigneeName) {
      if (isActor) {
        return "You updated the request assignment.";
      }

      if (viewer.role === "EMPLOYEE") {
        return `${actorName} updated the assignment for your request.`;
      }

      return `${actorName} updated the request assignment.`;
    }

    // Assigned for the first time, or moved from someone else.
    const verb = history.oldValue ? "reassigned" : "assigned";

    if (isActor) {
      const target = history.newValue === viewer.id ? "yourself" : assigneeName;

      return `You ${verb} this request to ${target}.`;
    }

    const target = history.newValue === viewer.id ? "you" : assigneeName;

    if (viewer.role === "EMPLOYEE") {
      return `${actorName} ${verb} your request to ${target}.`;
    }

    return `${actorName} ${verb} the request to ${target}.`;
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
