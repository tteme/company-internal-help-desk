import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import Badge from "../../components/ui/Badge";
import {
  startRequest,
  resolveRequest,
  confirmOrRejectRequest,
  rateRequest,
} from "../../services/request.service";
import { apiRequest } from "../../services/api";

const statusLabels = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  PENDING_EMPLOYEE: "Pending Employee",
  PENDING_INFORMATION: "Pending Information",
  ESCALATED: "Escalated",
  RESOLVED: "Resolved",
  REOPENED: "Reopened",
  REJECTED: "Rejected",
  CLOSED: "Closed",
};

const statusVariants = {
  OPEN: "info",
  ASSIGNED: "info",
  IN_PROGRESS: "accent",
  PENDING_EMPLOYEE: "warning",
  PENDING_INFORMATION: "warning",
  ESCALATED: "danger",
  RESOLVED: "success",
  REOPENED: "warning",
  REJECTED: "danger",
  CLOSED: "success",
};

const priorityLabels = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const priorityVariants = {
  LOW: "neutral",
  MEDIUM: "neutral",
  HIGH: "warning",
  CRITICAL: "danger",
};

function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingRequest, setIsStartingRequest] = useState(false);
  const [isResolvingRequest, setIsResolvingRequest] = useState(false);
  const [resolutionMessage, setResolutionMessage] = useState("");
  const [error, setError] = useState("");
  const [isConfirmingRequest, setIsConfirmingRequest] = useState(false);
  const [isRejectingRequest, setIsRejectingRequest] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState("");

  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);

  const isRequestCreator = request?.creatorId === user?.id;
  const isCurrentAssignee = request?.assigneeId === user?.id;

  const isAssignedOfficer =
    isCurrentAssignee && user?.role === "DEPARTMENT_OFFICER";

  const isAssignedDepartmentHead =
    isCurrentAssignee && user?.role === "DEPARTMENT_HEAD";

  const canStartRequest =
    isAssignedOfficer && ["ASSIGNED", "REOPENED"].includes(request?.status);

  const canResolveRequest =
    (isAssignedOfficer || isAssignedDepartmentHead) &&
    request?.status === "IN_PROGRESS";

  const canEscalateRequest =
    isAssignedOfficer && request?.status === "IN_PROGRESS";

  const canConfirmRequest =
    isRequestCreator && request?.status === "PENDING_EMPLOYEE";

  const canRateRequest = isRequestCreator && request?.status === "CLOSED";

  async function handleStartRequest() {
    try {
      setIsStartingRequest(true);
      setError("");

      await startRequest(request.id);

      const response = await apiRequest(`/requests/${id}`);
      setRequest(response.data);
    } catch (error) {
      setError(error.message || "Failed to start request.");
    } finally {
      setIsStartingRequest(false);
    }
  }

  async function handleResolveRequest() {
    if (!resolutionMessage.trim()) {
      setError("Resolution message is required.");
      return;
    }

    try {
      setIsResolvingRequest(true);
      setError("");

      await resolveRequest(request.id, resolutionMessage.trim());

      const response = await apiRequest(`/requests/${id}`);
      setRequest(response.data);

      setResolutionMessage("");
    } catch (error) {
      setError(error.message || "Failed to resolve request.");
    } finally {
      setIsResolvingRequest(false);
    }
  }

  async function handleConfirmRequest() {
    try {
      setIsConfirmingRequest(true);
      setError("");

      await confirmOrRejectRequest(request.id, "CONFIRM");

      const response = await apiRequest(`/requests/${id}`);
      setRequest(response.data);

      setShowRatingForm(true);
    } catch (error) {
      setError(error.message || "Failed to confirm resolution.");
    } finally {
      setIsConfirmingRequest(false);
    }
  }
  async function handleRejectRequest() {
    if (!rejectionMessage.trim()) {
      setError("Rejection message is required.");
      return;
    }

    try {
      setIsRejectingRequest(true);
      setError("");

      await confirmOrRejectRequest(
        request.id,
        "REJECT",
        rejectionMessage.trim(),
      );

      const response = await apiRequest(`/requests/${id}`);
      setRequest(response.data);

      setRejectionMessage("");
    } catch (error) {
      setError(error.message || "Failed to reject resolution.");
    } finally {
      setIsRejectingRequest(false);
    }
  }

  async function handleSubmitRating() {
    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    try {
      setIsSubmittingRating(true);
      setError("");

      await rateRequest(request.id, rating, ratingComment.trim());

      setShowRatingForm(false);
      setRating(0);
      setRatingComment("");

      const response = await apiRequest(`/requests/${id}`);
      setRequest(response.data);
    } catch (error) {
      setError(error.message || "Failed to submit rating.");
    } finally {
      setIsSubmittingRating(false);
    }
  }
  useEffect(() => {
    async function loadRequest() {
      try {
        setIsLoading(true);
        setError("");

        const response = await apiRequest(`/requests/${id}`);

        setRequest(response.data);
      } catch (error) {
        setError(error.message || "Failed to load request.");
      } finally {
        setIsLoading(false);
      }
    }

    loadRequest();
  }, [id]);

  if (isLoading) {
    return (
      <section>
        <p className="text-sm text-text-secondary">Loading request...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <p
          role="alert"
          className="rounded-lg border border-danger bg-danger-light p-6 text-sm text-danger"
        >
          {error}
        </p>
      </section>
    );
  }

  return (
    <section>
      <button
        type="button"
        onClick={() => navigate("/requests")}
        className="mb-5 text-sm font-medium text-text-secondary transition-colors hover:text-text"
      >
        ← Back to Requests
      </button>
      {/* Request Header */}
      <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-accent">
              {request.ticketNumber}
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-text">
              {request.title}
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              Created{" "}
              {request.createdAt
                ? new Date(request.createdAt).toLocaleString()
                : "—"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={priorityVariants[request.priority] || "neutral"}>
              {priorityLabels[request.priority] || request.priority}
            </Badge>

            <Badge variant={statusVariants[request.status] || "neutral"}>
              {statusLabels[request.status] || request.status}
            </Badge>
          </div>
        </div>
      </div>
      {/* Request Information */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-text">Request Information</h2>

        <div className="mt-5">
          <h3 className="text-sm font-medium text-text-secondary">
            Description
          </h3>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text">
            {request.description || "No description provided."}
          </p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Category
            </p>
            <p className="mt-1 text-sm font-medium text-text">
              {request.category?.name || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Department
            </p>
            <p className="mt-1 text-sm font-medium text-text">
              {request.department?.name || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Channel
            </p>
            <p className="mt-1 text-sm font-medium text-text">
              {request.channel || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Last Updated
            </p>
            <p className="mt-1 text-sm font-medium text-text">
              {request.updatedAt
                ? new Date(request.updatedAt).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
      </div>
      {/* Assignment */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Assignment</h2>

          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Current owner
          </span>
        </div>

        {request.assignee ? (
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-light text-sm font-semibold text-accent">
              {request.assignee.firstName?.charAt(0)}
              {request.assignee.lastName?.charAt(0)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-medium text-text">
                {request.assignee.firstName} {request.assignee.lastName}
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                {request.assignee.employeeId}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="neutral">
                {request.assignee.role?.replaceAll("_", " ")}
              </Badge>

              <Badge
                variant={
                  request.assignee.availability === "AVAILABLE"
                    ? "success"
                    : "warning"
                }
              >
                {request.assignee.availability?.replaceAll("_", " ") ||
                  "Unknown"}
              </Badge>
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm text-text-secondary">
            This request is not currently assigned.
          </p>
        )}

        {request.assignments?.length > 0 && (
          <div className="mt-6 border-t border-border pt-5">
            <p className="text-sm font-medium text-text-secondary">
              Assignment history
            </p>

            <p className="mt-1 text-sm text-text">
              {request.assignments.length}{" "}
              {request.assignments.length === 1 ? "assignment" : "assignments"}
            </p>
          </div>
        )}
      </div>

      {/* SLA */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-text">
            Service Level Agreement
          </h2>

          {request.sla?.resolutionBreached ? (
            <Badge variant="danger">Resolution SLA Breached</Badge>
          ) : (
            <Badge variant="success">Within SLA</Badge>
          )}
        </div>

        {request.sla ? (
          <>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  SLA Policy
                </p>

                <p className="mt-1 text-sm font-medium text-text">
                  {request.sla.slaPolicy?.name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Response Target
                </p>

                <p className="mt-1 text-sm font-medium text-text">
                  {request.sla.slaPolicy?.responseTimeMinutes ?? "—"} minutes
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Resolution Target
                </p>

                <p className="mt-1 text-sm font-medium text-text">
                  {request.sla.slaPolicy?.resolutionTimeMinutes ?? "—"} minutes
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Warning Threshold
                </p>

                <p className="mt-1 text-sm font-medium text-text">
                  {request.sla.slaPolicy?.warningPercentage ?? "—"}%
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    Resolution Deadline
                  </p>

                  <p className="mt-1 text-sm font-medium text-text">
                    {request.sla.resolutionDueAt
                      ? new Date(request.sla.resolutionDueAt).toLocaleString()
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    Breach Time
                  </p>

                  <p className="mt-1 text-sm font-medium text-text">
                    {request.sla.resolutionBreachedAt
                      ? new Date(
                          request.sla.resolutionBreachedAt,
                        ).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="mt-5 text-sm text-text-secondary">
            No SLA has been assigned to this request.
          </p>
        )}
      </div>
      {/* Conversation */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-text">Conversation</h2>

        {request.comments?.length > 0 ? (
          <div className="mt-5 space-y-5">
            {request.comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-lg border border-border bg-surface-muted p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-text">
                      {comment.author
                        ? `${comment.author.firstName} ${comment.author.lastName}`
                        : "Unknown user"}
                    </p>

                    {comment.author?.role && (
                      <p className="mt-0.5 text-xs uppercase tracking-wide text-text-muted">
                        {comment.author.role.replaceAll("_", " ")}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-text-muted">
                    {comment.createdAt
                      ? new Date(comment.createdAt).toLocaleString()
                      : "—"}
                  </p>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-text">
                  {comment.message || "No comment content."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-border bg-surface-muted px-5 py-8 text-center">
            <p className="text-sm font-medium text-text">No comments yet</p>

            <p className="mt-1 text-sm text-text-secondary">
              Conversation about this request will appear here.
            </p>
          </div>
        )}
      </div>
      {/* Activity History */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-text">Activity History</h2>

        {request.histories?.length > 0 ? (
          <div className="mt-6">
            <div className="space-y-6">
              {request.histories.map((history, index) => {
                const actorName = history.actor
                  ? `${history.actor.firstName} ${history.actor.lastName}`
                  : "System";

                const actorRole = history.actor?.role
                  ? history.actor.role.replaceAll("_", " ")
                  : "System";

                const actionLabels = {
                  CREATED: "Request Created",
                  ASSIGNED: "Request Assigned",
                  STATUS_CHANGED: "Status Changed",
                  ESCALATED: "Request Escalated",
                  COMMENTED: "Comment Added",
                  RESOLVED: "Request Resolved",
                  CONFIRMED: "Request Confirmed",
                  REOPENED: "Request Reopened",
                  RATED: "Request Rated",
                };

                const actionLabel =
                  actionLabels[history.action] || history.action;

                return (
                  <div key={history.id} className="relative flex gap-4">
                    {index < request.histories.length - 1 && (
                      <div className="absolute left-2 top-6 h-full w-px bg-border" />
                    )}

                    <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-light">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                    </div>

                    <div className="min-w-0 flex-1 pb-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-text">
                            {actionLabel}
                          </p>

                          <p className="mt-0.5 text-xs text-text-muted">
                            {actorName} · {actorRole}
                          </p>
                        </div>

                        <p className="text-xs text-text-muted">
                          {history.createdAt
                            ? new Date(history.createdAt).toLocaleString()
                            : "—"}
                        </p>
                      </div>

                      {history.description && (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                          {history.message}
                        </p>
                      )}

                      {(history.oldValue || history.newValue) && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                          {history.oldValue && (
                            <span className="rounded-md bg-surface-muted px-2 py-1 text-text-secondary">
                              {history.oldValue.replaceAll("_", " ")}
                            </span>
                          )}

                          {history.oldValue && history.newValue && (
                            <span className="text-text-muted">→</span>
                          )}

                          {history.newValue && (
                            <span className="rounded-md bg-accent-light px-2 py-1 text-accent">
                              {history.newValue.replaceAll("_", " ")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-border bg-surface-muted px-5 py-8 text-center">
            <p className="text-sm font-medium text-text">No activity yet</p>

            <p className="mt-1 text-sm text-text-secondary">
              Request activity will appear here.
            </p>
          </div>
        )}
      </div>
      {/* Request Actions */}
      {(canStartRequest ||
        canResolveRequest ||
        canEscalateRequest ||
        canConfirmRequest ||
        canRateRequest) && (
        <div className="mt-6 rounded-lg border border-border bg-surface p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-text">Actions</h2>

          <div className="mt-5 flex flex-wrap gap-3">
            {canStartRequest && (
              <button
                type="button"
                onClick={handleStartRequest}
                disabled={isStartingRequest}
                className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isStartingRequest ? "Starting..." : "Start Working"}
              </button>
            )}

            {canResolveRequest && (
              <div className="w-full rounded-lg border border-border bg-surface-muted p-4">
                <label
                  htmlFor="resolution-message"
                  className="block text-sm font-medium text-text"
                >
                  Resolution message
                </label>

                <textarea
                  id="resolution-message"
                  value={resolutionMessage}
                  onChange={(event) => setResolutionMessage(event.target.value)}
                  placeholder="Describe how the issue was resolved..."
                  rows={4}
                  maxLength={5000}
                  disabled={isResolvingRequest}
                  className="mt-2 w-full resize-y rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-text-muted">
                    {resolutionMessage.length}/5000
                  </span>

                  <button
                    type="button"
                    onClick={handleResolveRequest}
                    disabled={isResolvingRequest || !resolutionMessage.trim()}
                    className="rounded-md bg-success px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isResolvingRequest ? "Resolving..." : "Resolve Request"}
                  </button>
                </div>
              </div>
            )}

            {canEscalateRequest && (
              <button
                type="button"
                className="rounded-md border border-danger px-4 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger-light"
              >
                Escalate
              </button>
            )}

            {canConfirmRequest && (
              <button
                type="button"
                onClick={handleConfirmRequest}
                disabled={isConfirmingRequest || isRejectingRequest}
                className="rounded-md bg-success px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isConfirmingRequest ? "Confirming..." : "Confirm Resolution"}
              </button>
            )}

            {canConfirmRequest && (
              <div className="w-full rounded-lg border border-danger/20 bg-danger-light p-4">
                <label
                  htmlFor="rejection-message"
                  className="block text-sm font-medium text-text"
                >
                  Why are you rejecting the resolution?
                </label>

                <textarea
                  id="rejection-message"
                  value={rejectionMessage}
                  onChange={(event) => setRejectionMessage(event.target.value)}
                  placeholder="Explain what is still unresolved..."
                  rows={3}
                  maxLength={5000}
                  disabled={isRejectingRequest || isConfirmingRequest}
                  className="mt-2 w-full resize-y rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-danger focus:ring-2 focus:ring-danger/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-text-muted">
                    {rejectionMessage.length}/5000
                  </span>

                  <button
                    type="button"
                    onClick={handleRejectRequest}
                    disabled={
                      isRejectingRequest ||
                      isConfirmingRequest ||
                      !rejectionMessage.trim()
                    }
                    className="rounded-md border border-danger px-4 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger-light disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isRejectingRequest ? "Rejecting..." : "Reject Resolution"}
                  </button>
                </div>
              </div>
            )}

            {canRateRequest && showRatingForm && (
              <div className="w-full rounded-lg border border-accent/20 bg-accent-light p-5">
                <h3 className="text-base font-semibold text-text">
                  How was your request handled?
                </h3>

                <p className="mt-1 text-sm text-text-secondary">
                  Please rate the resolution you received.
                </p>

                <div className="mt-4 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      disabled={isSubmittingRating}
                      aria-label={`Rate ${value} out of 5`}
                      className={`text-3xl transition-transform hover:scale-110 disabled:cursor-not-allowed ${
                        value <= rating ? "text-accent" : "text-text-disabled"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <p className="mt-2 text-xs text-text-muted">
                  {rating > 0 ? `${rating} out of 5` : "Select a rating"}
                </p>

                <label
                  htmlFor="rating-comment"
                  className="mt-5 block text-sm font-medium text-text"
                >
                  Comment{" "}
                  <span className="font-normal text-text-muted">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="rating-comment"
                  value={ratingComment}
                  onChange={(event) => setRatingComment(event.target.value)}
                  placeholder="Tell us about your experience..."
                  rows={3}
                  maxLength={5000}
                  disabled={isSubmittingRating}
                  className="mt-2 w-full resize-y rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-text-muted">
                    {ratingComment.length}/5000
                  </span>

                  <button
                    type="button"
                    onClick={handleSubmitRating}
                    disabled={isSubmittingRating || rating === 0}
                    className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmittingRating ? "Submitting..." : "Submit Rating"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default RequestDetails;
