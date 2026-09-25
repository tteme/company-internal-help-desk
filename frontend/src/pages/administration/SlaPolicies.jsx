import { useState, useEffect } from "react";

import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal";
import SlaPolicyTable from "../../components/sla/SlaPolicyTable";
import SlaPolicyForm from "../../components/sla/SlaPolicyForm";

import {
  getSlaPolicies,
  createSlaPolicy,
  updateSlaPolicy,
  deactivateSlaPolicy,
  reactivateSlaPolicy,
} from "../../services/sla-policy.service";

import { getDepartments } from "../../services/department.service";

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function SlaPolicies() {
  const [slaPolicies, setSlaPolicies] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSlaPolicy, setSelectedSlaPolicy] = useState(null);
  const [formError, setFormError] = useState("");

  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [slaPolicyToDeactivate, setSlaPolicyToDeactivate] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError("");

        const [slaPoliciesResponse, departmentsResponse] = await Promise.all([
          getSlaPolicies(),
          getDepartments(),
        ]);

        setSlaPolicies(slaPoliciesResponse.data || []);

        const activeDepartments = (departmentsResponse.data || []).filter(
          (department) => department.isActive,
        );

        setDepartments(activeDepartments);
      } catch (error) {
        setError(error.message || "Failed to load SLA policy data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setCurrentPage(1);
  }

  function handleDepartmentFilterChange(event) {
    setDepartmentFilter(event.target.value);
    setCurrentPage(1);
  }

  function handlePriorityFilterChange(event) {
    setPriorityFilter(event.target.value);
    setCurrentPage(1);
  }

  function handleStatusFilterChange(event) {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  }

  function handleAddSlaPolicy() {
    setSelectedSlaPolicy(null);
    setFormError("");
    setIsFormOpen(true);
  }

  function handleEdit(slaPolicy) {
    setSelectedSlaPolicy(slaPolicy);
    setFormError("");
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    if (isSubmitting) {
      return;
    }

    setIsFormOpen(false);
    setSelectedSlaPolicy(null);
    setFormError("");
  }

  function handleRequestDeactivate(slaPolicy) {
    setSlaPolicyToDeactivate(slaPolicy);
    setIsDeactivateOpen(true);
  }

  function handleCloseDeactivate() {
    if (isSubmitting) {
      return;
    }

    setIsDeactivateOpen(false);
    setSlaPolicyToDeactivate(null);
  }

  async function handleSubmitSlaPolicy(slaPolicyData) {
    try {
      setIsSubmitting(true);
      setFormError("");

      if (selectedSlaPolicy) {
        const response = await updateSlaPolicy(
          selectedSlaPolicy.id,
          slaPolicyData,
        );

        setSlaPolicies((current) =>
          current.map((policy) =>
            policy.id === selectedSlaPolicy.id ? response.data : policy,
          ),
        );
      } else {
        const response = await createSlaPolicy(slaPolicyData);

        setSlaPolicies((current) => [response.data, ...current]);
      }

      handleCloseForm();
    } catch (error) {
      setFormError(error.message || "Failed to save SLA policy.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDeactivate() {
    if (!slaPolicyToDeactivate) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await deactivateSlaPolicy(slaPolicyToDeactivate.id);

      setSlaPolicies((current) =>
        current.map((policy) =>
          policy.id === slaPolicyToDeactivate.id ? response.data : policy,
        ),
      );

      handleCloseDeactivate();
    } catch (error) {
      setError(error.message || "Failed to deactivate SLA policy.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReactivate(slaPolicy) {
    try {
      setError("");

      const response = await reactivateSlaPolicy(slaPolicy.id);

      setSlaPolicies((current) =>
        current.map((policy) =>
          policy.id === slaPolicy.id ? response.data : policy,
        ),
      );
    } catch (error) {
      setError(error.message || "Failed to reactivate SLA policy.");
    }
  }

  const filteredSlaPolicies = slaPolicies.filter((slaPolicy) => {
    const searchTerm = search.trim().toLowerCase();

    const matchesSearch =
      !searchTerm ||
      slaPolicy.name.toLowerCase().includes(searchTerm) ||
      slaPolicy.description?.toLowerCase().includes(searchTerm) ||
      slaPolicy.department?.name?.toLowerCase().includes(searchTerm);

    const matchesDepartment =
      departmentFilter === "ALL" ||
      slaPolicy.departmentId === departmentFilter ||
      slaPolicy.department?.id === departmentFilter;

    const matchesPriority =
      priorityFilter === "ALL" || slaPolicy.priority === priorityFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && slaPolicy.isActive) ||
      (statusFilter === "INACTIVE" && !slaPolicy.isActive);

    return (
      matchesSearch && matchesDepartment && matchesPriority && matchesStatus
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSlaPolicies.length / pageSize),
  );

  const paginatedSlaPolicies = filteredSlaPolicies.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const rangeStart =
    filteredSlaPolicies.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filteredSlaPolicies.length);

  function handlePreviousPage() {
    setCurrentPage((page) => Math.max(1, page - 1));
  }

  function handleNextPage() {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }

  return (
    <section>
      <PageHeader
        title="SLA Policies"
        description="Manage response and resolution time targets by department and priority."
      />

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleAddSlaPolicy}
          className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          + Add SLA Policy
        </button>
      </div>

      {!isLoading && (
        <div className="mt-6 rounded-lg border border-border bg-surface p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label
                htmlFor="sla-search"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                Search
              </label>

              <input
                id="sla-search"
                type="search"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by name, description, or department..."
                className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div>
              <label
                htmlFor="department-filter"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                Department
              </label>

              <select
                id="department-filter"
                value={departmentFilter}
                onChange={handleDepartmentFilterChange}
                className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                <option value="ALL">All departments</option>

                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="priority-filter"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                Priority
              </label>

              <select
                id="priority-filter"
                value={priorityFilter}
                onChange={handlePriorityFilterChange}
                className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                <option value="ALL">All priorities</option>

                {PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0) + priority.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status-filter"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                Status
              </label>

              <select
                id="status-filter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-danger bg-danger-light p-4 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <section aria-label="SLA policy list" className="mt-6">
        {isLoading ? (
          <p className="rounded-lg border border-border bg-surface p-6 text-sm text-text-secondary">
            Loading SLA policies...
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <SlaPolicyTable
              slaPolicies={paginatedSlaPolicies}
              onEdit={handleEdit}
              onDeactivate={handleRequestDeactivate}
              onReactivate={handleReactivate}
            />

            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-text-muted">
                Showing{" "}
                <span className="font-medium text-text">
                  {rangeStart}-{rangeEnd}
                </span>{" "}
                of{" "}
                <span className="font-medium text-text">
                  {filteredSlaPolicies.length}
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

      {isFormOpen && (
        <Modal
          title={selectedSlaPolicy ? "Edit SLA Policy" : "Add SLA Policy"}
          size="lg"
          onClose={handleCloseForm}
        >
          {formError && (
            <div
              role="alert"
              className="mb-5 rounded-md border border-danger bg-danger-light px-4 py-3 text-sm text-danger"
            >
              {formError}
            </div>
          )}

          <SlaPolicyForm
            key={selectedSlaPolicy?.id || "create"}
            slaPolicy={selectedSlaPolicy}
            departments={departments}
            onSubmit={handleSubmitSlaPolicy}
            onCancel={handleCloseForm}
            isSubmitting={isSubmitting}
          />
        </Modal>
      )}

      {isDeactivateOpen && slaPolicyToDeactivate && (
        <Modal
          title="Deactivate SLA Policy"
          size="sm"
          onClose={handleCloseDeactivate}
        >
          <div>
            <p className="text-sm text-text-secondary">
              Are you sure you want to deactivate{" "}
              <span className="font-semibold text-text">
                {slaPolicyToDeactivate.name}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-text-muted">
              The policy will remain in the system, but it will no longer apply
              to new requests for this department and priority.
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

export default SlaPolicies;
