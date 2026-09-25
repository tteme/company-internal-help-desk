import { useEffect, useState } from "react";

import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal";
import BranchTable from "../../components/branches/BranchTable";
import BranchForm from "../../components/branches/BranchForm";
import {
  createBranch,
  deactivateBranch,
  getBranches,
  updateBranch,
} from "../../services/branch.service";

function Branches() {
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [branchToDeactivate, setBranchToDeactivate] = useState(null);

  useEffect(() => {
    async function loadBranches() {
      try {
        const response = await getBranches();

        setBranches(response.data);
      } catch (error) {
        setError(error.message || "Failed to load branches.");
      } finally {
        setIsLoading(false);
      }
    }

    loadBranches();
  }, []);

  function handleAddBranch() {
    setSelectedBranch(null);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setSelectedBranch(null);
  }

  function handleEdit(branch) {
    setSelectedBranch(branch);
    setIsFormOpen(true);
  }

  function handleDeactivate(branch) {
    setBranchToDeactivate(branch);
    setIsDeactivateOpen(true);
  }

  function handleCloseDeactivate() {
    setIsDeactivateOpen(false);
    setBranchToDeactivate(null);
  }

  async function handleSubmitBranch(branchData) {
    try {
      setIsSubmitting(true);
      setError("");

      if (selectedBranch) {
        const response = await updateBranch(selectedBranch.id, branchData);

        setBranches((currentBranches) =>
          currentBranches.map((branch) =>
            branch.id === selectedBranch.id ? response.data : branch,
          ),
        );
      } else {
        const response = await createBranch(branchData);

        setBranches((currentBranches) => [response.data, ...currentBranches]);
      }

      handleCloseForm();
    } catch (error) {
      setError(error.message || "Failed to save branch.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDeactivate() {
    try {
      setIsSubmitting(true);
      setError("");

      const response = await deactivateBranch(branchToDeactivate.id);

      setBranches((currentBranches) =>
        currentBranches.map((branch) =>
          branch.id === branchToDeactivate.id ? response.data : branch,
        ),
      );

      handleCloseDeactivate();
    } catch (error) {
      setError(error.message || "Failed to deactivate branch.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredBranches = branches.filter((branch) => {
    const searchTerm = search.trim().toLowerCase();

    const matchesSearch =
      !searchTerm ||
      branch.name.toLowerCase().includes(searchTerm) ||
      branch.code.toLowerCase().includes(searchTerm) ||
      branch.address?.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && branch.isActive) ||
      (statusFilter === "inactive" && !branch.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <section>
      <PageHeader
        title="Branches"
        description="Manage Digaf branches and branch information."
      />

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleAddBranch}
          className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          + Add Branch
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="branch-search" className="sr-only">
            Search branches
          </label>

          <input
            id="branch-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by branch name, code, or address..."
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div className="sm:w-44">
          <label htmlFor="branch-status" className="sr-only">
            Filter by status
          </label>

          <select
            id="branch-status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <section aria-label="Branch list" className="mt-6">
        {isLoading ? (
          <p className="rounded-lg border border-border bg-surface p-6 text-sm text-text-secondary">
            Loading branches...
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
            <BranchTable
              branches={filteredBranches}
              onEdit={handleEdit}
              onDeactivate={handleDeactivate}
            />
          </div>
        )}
      </section>

      {isFormOpen && (
        <Modal
          title={selectedBranch ? "Edit Branch" : "Add Branch"}
          size="lg"
          onClose={handleCloseForm}
        >
          <BranchForm
            key={selectedBranch?.id || "create"}
            branch={selectedBranch}
            onSubmit={handleSubmitBranch}
            onCancel={handleCloseForm}
            isSubmitting={isSubmitting}
          />
        </Modal>
      )}

      {isDeactivateOpen && branchToDeactivate && (
        <Modal
          title="Deactivate Branch"
          size="sm"
          onClose={handleCloseDeactivate}
        >
          <div>
            <p className="text-sm text-text-secondary">
              Are you sure you want to deactivate{" "}
              <span className="font-semibold text-text">
                {branchToDeactivate.name}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-text-muted">
              The branch will remain in the system, but it will no longer be
              available for new user assignments.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseDeactivate}
                disabled={isSubmitting}
                className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDeactivate}
                disabled={isSubmitting}
                className="rounded-md bg-danger px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

export default Branches;
