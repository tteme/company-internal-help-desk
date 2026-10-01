import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRequests } from "../../services/request.service";
import EscalationTable from "./EscalationTable";

function Escalations() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);

  // Request parameters controlled by the frontend.
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Pagination metadata returned by the backend.
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEscalations() {
      try {
        setIsLoading(true);
        setError("");

        const response = await getRequests({
          page,
          limit,
          status: "ESCALATED",
        });

        setRequests(response.data || []);

        setPagination(
          response.pagination || {
            total: 0,
            totalPages: 0,
          },
        );
      } catch (error) {
        setError(error.message || "Failed to load escalations.");
      } finally {
        setIsLoading(false);
      }
    }

    loadEscalations();
  }, [page, limit]);

  function handleViewRequest(requestId) {
    navigate(`/requests/${requestId}`);
  }

  function handlePreviousPage() {
    if (page > 1) {
      setPage((currentPage) => currentPage - 1);
    }
  }

  function handleNextPage() {
    if (page < pagination.totalPages) {
      setPage((currentPage) => currentPage + 1);
    }
  }

  if (isLoading) {
    return (
      <section>
        <h1 className="text-2xl font-semibold text-text">Escalations</h1>

        <p className="mt-2 text-sm text-text-secondary">
          Loading escalated requests...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h1 className="text-2xl font-semibold text-text">Escalations</h1>

        <p className="mt-4 rounded-lg border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section>
      <div>
        <h1 className="text-2xl font-semibold text-text">Escalations</h1>

        <p className="mt-1 text-sm text-text-secondary">
          Review requests escalated to your department.
        </p>
      </div>

      <div className="mt-6">
        <EscalationTable requests={requests} onView={handleViewRequest} />
      </div>

      {pagination.total > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
          <p className="text-sm text-text-secondary">
            Showing{" "}
            <span className="font-medium text-text">
              {(page - 1) * limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-text">
              {Math.min(page * limit, pagination.total)}
            </span>{" "}
            of <span className="font-medium text-text">{pagination.total}</span>{" "}
            escalations
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="px-2 text-sm text-text-secondary">
              Page <span className="font-medium text-text">{page}</span> of{" "}
              <span className="font-medium text-text">
                {pagination.totalPages}
              </span>
            </span>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={page >= pagination.totalPages}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Escalations;
