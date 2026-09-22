import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import RequestFilters from "../../components/requests/RequestFilters";
import RequestTable from "../../components/requests/RequestTable";
import { getRequests } from "../../services/request.service";

function Requests() {
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  console.log("Current authenticated user:", user);
  console.log("Current user role:", user?.role);
  const canCreateRequest = user?.role === "EMPLOYEE";
  console.log("Can create request:", canCreateRequest);

  const [requests, setRequests] = useState([]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  // Request parameters controlled by the frontend.
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Pagination metadata returned by the backend.
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounce search input before sending it to the API.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // Load requests whenever the request parameters change.
  useEffect(() => {
    async function loadRequests() {
      try {
        setIsLoading(true);
        setError("");

        const response = await getRequests({
          page,
          limit,
          search: debouncedSearch,
          status,
          priority,
        });

        setRequests(response.data);
        setPagination(response.pagination);
      } catch (error) {
        setError(error.message || "Failed to load requests.");
      } finally {
        setIsLoading(false);
      }
    }

    loadRequests();
  }, [page, limit, debouncedSearch, status, priority]);

  function handleSearchChange(nextSearch) {
    setSearch(nextSearch);
    setPage(1);
  }

  function handleStatusChange(nextStatus) {
    setStatus(nextStatus);
    setPage(1);
  }

  function handlePriorityChange(nextPriority) {
    setPriority(nextPriority);
    setPage(1);
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);
  }

  return (
    <section>
      <PageHeader
        title="Requests"
        description="Manage and track help desk requests."
      />

      {canCreateRequest && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/requests/create")}
            className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            Create Request
          </button>
        </div>
      )}

      <div className="mt-6">
        <RequestFilters
          search={search}
          status={status}
          priority={priority}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
        />
      </div>

      <section aria-label="Request list" className="mt-6">
        {isLoading ? (
          <p className="rounded-lg border border-border bg-surface p-6 text-sm text-text-secondary">
            Loading requests...
          </p>
        ) : error ? (
          <p
            role="alert"
            className="rounded-lg border border-danger bg-danger-light p-6 text-sm text-danger"
          >
            {error}
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <RequestTable requests={requests} />

            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={limit}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>
    </section>
  );
}

export default Requests;
