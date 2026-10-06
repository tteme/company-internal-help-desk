import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/ui/PageHeader";
import { getClientFeedbacks } from "../../services/client-feedback.service";

function ClientFeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ============================================================
  // PAGINATION
  // ============================================================
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    async function loadFeedbacks() {
      try {
        setIsLoading(true);
        setError("");

        const response = await getClientFeedbacks();

        setFeedbacks(response.data ?? []);
      } catch (error) {
        setError(error.message || "Failed to load client feedback.");
      } finally {
        setIsLoading(false);
      }
    }

    loadFeedbacks();
  }, []);

  // ============================================================
  // SEARCH / FILTER
  // ============================================================

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setCurrentPage(1);
  }

  function handleStatusFilterChange(event) {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  }

  // ============================================================
  // FILTERING
  // ============================================================

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const searchTerm = search.trim().toLowerCase();

    const matchesSearch =
      !searchTerm ||
      feedback.referenceNumber?.toLowerCase().includes(searchTerm) ||
      feedback.fullName?.toLowerCase().includes(searchTerm) ||
      feedback.title?.name?.toLowerCase().includes(searchTerm) ||
      feedback.phoneNumber?.toLowerCase().includes(searchTerm) ||
      feedback.description?.toLowerCase().includes(searchTerm) ||
      feedback.department?.name?.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || feedback.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFeedbacks.length / pageSize),
  );

  const paginatedFeedbacks = filteredFeedbacks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const rangeStart =
    filteredFeedbacks.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const rangeEnd = Math.min(currentPage * pageSize, filteredFeedbacks.length);

  function handlePreviousPage() {
    setCurrentPage((page) => Math.max(1, page - 1));
  }

  function handleNextPage() {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }

  // ============================================================
  // STATUS LABEL
  // ============================================================

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

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section>
      <PageHeader
        title="Client Feedback"
        description="Review and manage feedback submitted by Digaf clients."
      />

      {/* SEARCH + FILTER */}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="feedback-search" className="sr-only">
            Search client feedback
          </label>

          <input
            id="feedback-search"
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by reference, client, title, phone, or description..."
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div className="sm:w-52">
          <label htmlFor="feedback-status" className="sr-only">
            Filter by status
          </label>

          <select
            id="feedback-status"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="all">All statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="ADDRESSED">Addressed</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-danger bg-danger-light p-4 text-sm text-danger"
        >
          {error}
        </p>
      )}

      {/* TABLE */}

      <section aria-label="Client feedback list" className="mt-6">
        {isLoading ? (
          <p className="rounded-lg border border-border bg-surface p-6 text-sm text-text-secondary">
            Loading client feedback...
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-surface-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Reference
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Client
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Phone
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Department
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Status
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Submitted
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {paginatedFeedbacks.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-sm text-text-muted"
                      >
                        No client feedback found.
                      </td>
                    </tr>
                  ) : (
                    paginatedFeedbacks.map((feedback) => (
                      <tr
                        key={feedback.id}
                        className="transition-colors hover:bg-surface-muted/50"
                      >
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-text">
                          {feedback.referenceNumber}
                        </td>

                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-text">
                            {feedback.fullName}
                          </div>

                          <div className="mt-0.5 text-xs text-text-muted">
                            {feedback.title?.name || "—"}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-text-secondary">
                          {feedback.phoneNumber}
                        </td>

                        <td className="px-4 py-4 text-sm text-text-secondary">
                          {feedback.department?.name || "—"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          <span
                            className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${getStatusClassName(
                              feedback.status,
                            )}`}
                          >
                            {getStatusLabel(feedback.status)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-text-secondary">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => navigate(`/feedback/${feedback.id}`)}
                            className="text-sm font-medium text-accent hover:underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}

            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-text-muted">
                Showing{" "}
                <span className="font-medium text-text">
                  {rangeStart}-{rangeEnd}
                </span>{" "}
                of{" "}
                <span className="font-medium text-text">
                  {filteredFeedbacks.length}
                </span>
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="text-sm text-text-muted">
                  Page{" "}
                  <span className="font-medium text-text">{currentPage}</span>{" "}
                  of <span className="font-medium text-text">{totalPages}</span>
                </span>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </section>
  );
}

export default ClientFeedbackList;
