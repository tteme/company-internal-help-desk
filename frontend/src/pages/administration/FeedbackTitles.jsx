import { useEffect, useMemo, useState } from "react";

import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal";

import ClientFeedbackTitleTable from "../../components/client-feedback/ClientFeedbackTitleTable";
import ClientFeedbackTitleForm from "../../components/client-feedback/ClientFeedbackTitleForm";

import {
  getClientFeedbackTitles,
  createClientFeedbackTitle,
  updateClientFeedbackTitle,
  deactivateClientFeedbackTitle,
} from "../../services/client-feedback-title.service";

function FeedbackTitles() {
  const [titles, setTitles] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [titleToDeactivate, setTitleToDeactivate] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    const loadTitles = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getClientFeedbackTitles();

        setTitles(response.data || []);
      } catch (err) {
        console.error("Failed to load feedback titles:", err);

        setError(err.message || "Failed to load feedback titles.");
      } finally {
        setIsLoading(false);
      }
    };

    loadTitles();
  }, []);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setSelectedTitle(null);
    setIsFormOpen(true);
  };

  const handleEdit = (title) => {
    setSelectedTitle(title);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    if (isSubmitting) {
      return;
    }

    setIsFormOpen(false);
    setSelectedTitle(null);
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setError("");

      if (selectedTitle) {
        const response = await updateClientFeedbackTitle(
          selectedTitle.id,
          formData.name,
          formData.isActive,
        );

        const updatedTitle = response.data;

        setTitles((current) =>
          current.map((title) =>
            title.id === updatedTitle.id ? updatedTitle : title,
          ),
        );
      } else {
        const response = await createClientFeedbackTitle(formData.name);

        const createdTitle = response.data;

        setTitles((current) => [createdTitle, ...current]);
      }

      setIsFormOpen(false);
      setSelectedTitle(null);
    } catch (err) {
      console.error("Failed to save feedback title:", err);

      setError(err.message || "Failed to save feedback title.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = (title) => {
    setTitleToDeactivate(title);
  };

  const handleConfirmDeactivate = async () => {
    if (!titleToDeactivate) {
      return;
    }

    try {
      setIsDeactivating(true);
      setError("");

      const response = await deactivateClientFeedbackTitle(
        titleToDeactivate.id,
      );

      const deactivatedTitle = response.data;

      setTitles((current) =>
        current.map((title) =>
          title.id === deactivatedTitle.id ? deactivatedTitle : title,
        ),
      );

      setTitleToDeactivate(null);
    } catch (err) {
      console.error("Failed to deactivate feedback title:", err);

      setError(err.message || "Failed to deactivate feedback title.");
    } finally {
      setIsDeactivating(false);
    }
  };

  const filteredTitles = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return titles.filter((title) => {
      const matchesSearch =
        !searchTerm || title.name.toLowerCase().includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && title.isActive) ||
        (statusFilter === "inactive" && !title.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [titles, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTitles.length / pageSize));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTitles = filteredTitles.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  const rangeStart =
    filteredTitles.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;

  const rangeEnd = Math.min(safeCurrentPage * pageSize, filteredTitles.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feedback Titles"
        description="Manage the feedback title options available to clients."
        actions={
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            + Add Feedback Title
          </button>
        }
      />

      <div className="rounded-xl border border-border bg-surface">
        <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-md">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search feedback titles..."
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-muted outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="statusFilter"
              className="text-sm font-medium text-text-secondary"
            >
              Status
            </label>

            <select
              id="statusFilter"
              value={statusFilter}
              onChange={handleStatusChange}
              className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="border-b border-danger/20 bg-danger-light px-5 py-3">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-text-muted">
              Loading feedback titles...
            </p>
          </div>
        ) : (
          <>
            <ClientFeedbackTitleTable
              titles={paginatedTitles}
              onEdit={handleEdit}
              onDeactivate={handleDeactivate}
            />

            {filteredTitles.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-text-muted">
                  Showing {rangeStart}–{rangeEnd} of {filteredTitles.length}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={safeCurrentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span className="px-2 text-sm text-text-muted">
                    Page {safeCurrentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isFormOpen && (
        <Modal
          title={selectedTitle ? "Edit Feedback Title" : "Add Feedback Title"}
          onClose={handleCloseForm}
        >
          <ClientFeedbackTitleForm
            title={selectedTitle}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isSubmitting={isSubmitting}
          />
        </Modal>
      )}

      {titleToDeactivate && (
        <Modal
          title="Deactivate Feedback Title"
          onClose={() => {
            if (!isDeactivating) {
              setTitleToDeactivate(null);
            }
          }}
        >
          <div className="space-y-5">
            <p className="text-sm text-text-secondary">
              Are you sure you want to deactivate{" "}
              <span className="font-medium text-text">
                {titleToDeactivate.name}
              </span>
              ?
            </p>

            <p className="text-sm text-text-muted">
              This title will no longer be available to clients when submitting
              new feedback. Existing feedback records will remain unchanged.
            </p>

            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setTitleToDeactivate(null)}
                disabled={isDeactivating}
                className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDeactivate}
                disabled={isDeactivating}
                className="rounded-lg bg-danger px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeactivating ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default FeedbackTitles;
