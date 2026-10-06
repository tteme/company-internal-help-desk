import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import {
  getClientFeedbackById,
  assignClientFeedback,
  updateClientFeedbackStatus,
  addClientFeedbackUpdate,
} from "../../services/client-feedback.service";
import { getDepartments } from "../../services/department.service";
import { getUsers } from "../../services/user.service";

function ClientFeedbackDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);

  const isAdministrator =
    user?.role === "ADMIN" || user?.role === "SYSTEM_ADMINISTRATOR";

  const [feedback, setFeedback] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Assignment state
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedAssignedToId, setSelectedAssignedToId] = useState("");

  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const [assignmentSuccess, setAssignmentSuccess] = useState("");

  // Status state
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusSuccess, setStatusSuccess] = useState("");

  // Internal update state
  const [updateMessage, setUpdateMessage] = useState("");
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError("");

        // All authorized feedback users need the feedback itself.
        const feedbackResponse = await getClientFeedbackById(id);

        const feedbackData = feedbackResponse.data;

        setFeedback(feedbackData);
        setSelectedDepartmentId(feedbackData.departmentId ?? "");
        setSelectedAssignedToId(feedbackData.assignedToId ?? "");
        setSelectedStatus(feedbackData.status ?? "");

        // Only administrators need departments and users
        // because only they can assign feedback.
        if (isAdministrator) {
          const [departmentsResponse, usersResponse] = await Promise.all([
            getDepartments(),
            getUsers(),
          ]);

          setDepartments(departmentsResponse.data ?? []);
          setUsers(usersResponse.data ?? []);
        }
      } catch (error) {
        setError(error.message || "Failed to load client feedback.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id, isAdministrator]);

  function getStatusLabel(status) {
    switch (status) {
      case "PENDING_REVIEW":
        return "Pending Review";
      case "ASSIGNED":
        return "Assigned";
      case "IN_REVIEW":
        return "In Review";
      case "ADDRESSED":
        return "Addressed";
      case "DISMISSED":
        return "Dismissed";
      default:
        return status;
    }
  }

  function getStatusClassName(status) {
    switch (status) {
      case "PENDING_REVIEW":
        return "bg-warning-light text-warning";
      case "ASSIGNED":
        return "bg-primary-light text-primary";
      case "IN_REVIEW":
        return "bg-info-light text-info";
      case "ADDRESSED":
        return "bg-success-light text-success";
      case "DISMISSED":
        return "bg-danger-light text-danger";
      default:
        return "bg-surface-muted text-text-muted";
    }
  }

  const assignableUsers = users.filter(
    (user) =>
      user.status === "ACTIVE" &&
      user.isActive === true &&
      ["DEPARTMENT_OFFICER", "DEPARTMENT_HEAD"].includes(user.role) &&
      user.department?.id === selectedDepartmentId,
  );

  const statusOptions = {
    PENDING_REVIEW: ["DISMISSED"],
    ASSIGNED: ["IN_REVIEW", "ADDRESSED"],
    IN_REVIEW: ["ADDRESSED"],
    ADDRESSED: [],
    DISMISSED: [],
  };

  const availableStatuses = statusOptions[feedback?.status] ?? [];

  async function handleUpdateStatus() {
    if (!selectedStatus || selectedStatus === feedback.status) {
      return;
    }

    try {
      setIsUpdatingStatus(true);
      setStatusError("");
      setStatusSuccess("");

      const response = await updateClientFeedbackStatus(
        feedback.id,
        selectedStatus,
      );

      setFeedback((currentFeedback) => ({
        ...currentFeedback,
        ...response.data,
      }));

      setSelectedStatus(response.data.status);
      setStatusSuccess("Feedback status updated successfully.");
    } catch (error) {
      setSelectedStatus(feedback.status);
      setStatusError(error.message || "Failed to update feedback status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleAssignFeedback() {
    if (!selectedDepartmentId || !selectedAssignedToId) {
      setAssignmentError(
        "Please select a department and an officer or department head.",
      );
      setAssignmentSuccess("");
      return;
    }

    try {
      setIsAssigning(true);
      setAssignmentError("");
      setAssignmentSuccess("");

      const response = await assignClientFeedback(
        feedback.id,
        selectedDepartmentId,
        selectedAssignedToId,
      );

      setFeedback((currentFeedback) => ({
        ...currentFeedback,
        ...response.data,
      }));

      setSelectedStatus(response.data.status);
      setAssignmentSuccess("Feedback assigned successfully.");
    } catch (error) {
      setAssignmentError(error.message || "Failed to assign client feedback.");
    } finally {
      setIsAssigning(false);
    }
  }

  async function handleAddUpdate() {
    const message = updateMessage.trim();

    if (!message) {
      setUpdateError("Please enter an internal update.");
      setUpdateSuccess("");
      return;
    }

    try {
      setIsAddingUpdate(true);
      setUpdateError("");
      setUpdateSuccess("");

      const response = await addClientFeedbackUpdate(feedback.id, message);

      setFeedback((currentFeedback) => ({
        ...currentFeedback,
        updates: [...(currentFeedback.updates ?? []), response.data],
      }));

      setUpdateMessage("");
      setUpdateSuccess("Internal update added successfully.");
    } catch (error) {
      setUpdateError(error.message || "Failed to add internal update.");
    } finally {
      setIsAddingUpdate(false);
    }
  }

  if (isLoading) {
    return (
      <section>
        <PageHeader
          title="Client Feedback"
          description="View client feedback details."
        />

        <div className="mt-6 rounded-lg border border-border bg-surface p-6">
          <p className="text-sm text-text-secondary">
            Loading client feedback...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <PageHeader
          title="Client Feedback"
          description="View client feedback details."
        />

        <div className="mt-6 rounded-lg border border-danger bg-danger-light p-4">
          <p className="text-sm text-danger">{error}</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/feedback")}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Feedback
        </button>
      </section>
    );
  }

  if (!feedback) {
    return null;
  }

  return (
    <section>
      <PageHeader
        title={feedback.referenceNumber}
        description="View and manage client feedback."
        actions={
          <button
            type="button"
            onClick={() => navigate("/feedback")}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        }
      />

      <div className="mt-6 space-y-6">
        {/* Feedback Summary */}
        <section className="rounded-lg border border-border bg-surface">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-text">
                Feedback Summary
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                Submitted {new Date(feedback.createdAt).toLocaleString()}
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-medium ${getStatusClassName(
                feedback.status,
              )}`}
            >
              {getStatusLabel(feedback.status)}
            </span>
          </div>

          <div className="grid gap-6 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Reference
              </p>

              <p className="mt-1 text-sm font-medium text-text">
                {feedback.referenceNumber}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Submitted
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                {new Date(feedback.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Last Updated
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                {new Date(feedback.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </section>

        {/* Client Information */}
        <section className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-text">
              Client Information
            </h2>
          </div>

          <div className="grid gap-6 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Full Name
              </p>

              <p className="mt-1 text-sm font-medium text-text">
                {feedback.fullName}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Feedback Title
              </p>

              <p className="mt-1 text-sm font-medium text-text">
                {feedback.title?.name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Phone Number
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                {feedback.phoneNumber}
              </p>
            </div>
          </div>
        </section>

        {/* Feedback */}
        <section className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-text">Feedback</h2>
          </div>

          <div className="px-5 py-5">
            <p className="whitespace-pre-wrap text-sm leading-6 text-text-secondary">
              {feedback.description}
            </p>
          </div>
        </section>

        {/* Status */}
        <section className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-text">Status</h2>
          </div>

          <div className="space-y-5 px-5 py-5">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Current Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${getStatusClassName(
                    feedback.status,
                  )}`}
                >
                  {getStatusLabel(feedback.status)}
                </span>
              </div>

              {availableStatuses.length > 0 && (
                <div>
                  <label
                    htmlFor="feedback-status"
                    className="mb-1.5 block text-sm font-medium text-text"
                  >
                    Change Status
                  </label>

                  <select
                    id="feedback-status"
                    value={selectedStatus}
                    onChange={(event) => {
                      setSelectedStatus(event.target.value);
                      setStatusError("");
                      setStatusSuccess("");
                    }}
                    disabled={isUpdatingStatus}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value={feedback.status}>
                      {getStatusLabel(feedback.status)}
                    </option>

                    {availableStatuses.map((status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {statusError && (
              <p
                role="alert"
                className="rounded-lg border border-danger bg-danger-light p-3 text-sm text-danger"
              >
                {statusError}
              </p>
            )}

            {statusSuccess && (
              <p className="rounded-lg border border-success bg-success-light p-3 text-sm text-success">
                {statusSuccess}
              </p>
            )}

            {availableStatuses.length > 0 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={
                    isUpdatingStatus || selectedStatus === feedback.status
                  }
                  className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdatingStatus ? "Updating..." : "Update Status"}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Assignment */}
        <section className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-text">Assignment</h2>
          </div>

          <div className="space-y-5 px-5 py-5">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Current Department
                </p>

                <p className="mt-1 text-sm text-text-secondary">
                  {feedback.department?.name || "Not assigned"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Assigned To
                </p>

                <p className="mt-1 text-sm text-text-secondary">
                  {feedback.assignedTo
                    ? `${feedback.assignedTo.firstName} ${feedback.assignedTo.lastName}`
                    : "Not assigned"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Assigned By
                </p>

                <p className="mt-1 text-sm text-text-secondary">
                  {feedback.assignedBy
                    ? `${feedback.assignedBy.firstName} ${feedback.assignedBy.lastName}`
                    : "—"}
                </p>
              </div>
            </div>

            {isAdministrator && feedback.status === "PENDING_REVIEW" && (
              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-semibold text-text">
                  Assign Feedback
                </h3>

                <p className="mt-1 text-sm text-text-secondary">
                  Select the department and the officer or department head who
                  should review this feedback.
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {/* Department */}
                  <div>
                    <label
                      htmlFor="feedback-department"
                      className="mb-1.5 block text-sm font-medium text-text"
                    >
                      Department
                    </label>

                    <select
                      id="feedback-department"
                      value={selectedDepartmentId}
                      onChange={(event) => {
                        setSelectedDepartmentId(event.target.value);
                        setSelectedAssignedToId("");
                        setAssignmentError("");
                        setAssignmentSuccess("");
                      }}
                      className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                    >
                      <option value="">Select department</option>

                      {departments
                        .filter((department) => department.isActive)
                        .map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Assigned User */}
                  <div>
                    <label
                      htmlFor="feedback-assigned-to"
                      className="mb-1.5 block text-sm font-medium text-text"
                    >
                      Assign To
                    </label>

                    <select
                      id="feedback-assigned-to"
                      value={selectedAssignedToId}
                      onChange={(event) => {
                        setSelectedAssignedToId(event.target.value);
                        setAssignmentError("");
                        setAssignmentSuccess("");
                      }}
                      disabled={!selectedDepartmentId}
                      className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">
                        {selectedDepartmentId
                          ? "Select officer or department head"
                          : "Select department first"}
                      </option>

                      {assignableUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} —{" "}
                          {user.role === "DEPARTMENT_HEAD"
                            ? "Department Head"
                            : "Department Officer"}
                        </option>
                      ))}
                    </select>

                    {selectedDepartmentId && assignableUsers.length === 0 && (
                      <p className="mt-1.5 text-xs text-text-muted">
                        No active department officers or heads are available in
                        this department.
                      </p>
                    )}
                  </div>
                </div>

                {assignmentError && (
                  <p
                    role="alert"
                    className="mt-4 rounded-lg border border-danger bg-danger-light p-3 text-sm text-danger"
                  >
                    {assignmentError}
                  </p>
                )}

                {assignmentSuccess && (
                  <p className="mt-4 rounded-lg border border-success bg-success-light p-3 text-sm text-success">
                    {assignmentSuccess}
                  </p>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAssignFeedback}
                    disabled={
                      isAssigning ||
                      !selectedDepartmentId ||
                      !selectedAssignedToId
                    }
                    className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isAssigning ? "Assigning..." : "Assign Feedback"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Internal Updates */}
        <section className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-text">
              Internal Updates
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Internal communication between administrators and the assigned
              officer or department head.
            </p>
          </div>

          <div className="space-y-6 px-5 py-5">
            {/* Add Update */}
            {feedback.status !== "DISMISSED" && (
              <div>
                <label
                  htmlFor="feedback-update"
                  className="mb-1.5 block text-sm font-medium text-text"
                >
                  Add Internal Update
                </label>

                <textarea
                  id="feedback-update"
                  value={updateMessage}
                  onChange={(event) => {
                    setUpdateMessage(event.target.value);
                    setUpdateError("");
                    setUpdateSuccess("");
                  }}
                  rows={4}
                  maxLength={2000}
                  placeholder="Write an internal update..."
                  disabled={isAddingUpdate}
                  className="w-full resize-y rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-text-muted">
                    This update is visible only to authorized internal users.
                  </p>

                  <span className="text-xs text-text-muted">
                    {updateMessage.length}/2000
                  </span>
                </div>

                {updateError && (
                  <p
                    role="alert"
                    className="mt-3 rounded-lg border border-danger bg-danger-light p-3 text-sm text-danger"
                  >
                    {updateError}
                  </p>
                )}

                {updateSuccess && (
                  <p className="mt-3 rounded-lg border border-success bg-success-light p-3 text-sm text-success">
                    {updateSuccess}
                  </p>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddUpdate}
                    disabled={isAddingUpdate || !updateMessage.trim()}
                    className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isAddingUpdate ? "Adding..." : "Add Update"}
                  </button>
                </div>
              </div>
            )}

            {/* Update History */}
            <div
              className={
                feedback.status !== "DISMISSED"
                  ? "border-t border-border pt-6"
                  : ""
              }
            >
              <h3 className="text-sm font-semibold text-text">
                Update History
              </h3>

              <div className="mt-4">
                {!feedback.updates || feedback.updates.length === 0 ? (
                  <p className="text-sm text-text-muted">
                    No internal updates yet.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {feedback.updates.map((update) => (
                      <article
                        key={update.id}
                        className="border-l-2 border-border pl-4"
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-medium text-text">
                            {update.user
                              ? `${update.user.firstName} ${update.user.lastName}`
                              : "System User"}
                          </p>

                          <time className="text-xs text-text-muted">
                            {new Date(update.createdAt).toLocaleString()}
                          </time>
                        </div>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                          {update.message}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

export default ClientFeedbackDetails;
