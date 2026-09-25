import { useEffect, useState } from "react";

import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal";
import DepartmentTable from "../../components/departments/DepartmentTable";
import DepartmentForm from "../../components/departments/DepartmentForm";
import {
  createDepartment,
  deactivateDepartment,
  getDepartments,
  updateDepartment,
} from "../../services/department.service";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [departmentToDeactivate, setDepartmentToDeactivate] = useState(null);

  useEffect(() => {
    async function loadDepartments() {
      try {
        setIsLoading(true);
        setError("");

        const response = await getDepartments();
        console.log("Departments API response:", response.data);

        setDepartments(response.data);
      } catch (error) {
        setError(error.message || "Failed to load departments.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDepartments();
  }, []);

  function handleAddDepartment() {
    setSelectedDepartment(null);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setSelectedDepartment(null);
  }

  function handleEdit(department) {
    setSelectedDepartment(department);
    setIsFormOpen(true);
  }

  function handleDeactivate(department) {
    setDepartmentToDeactivate(department);
    setIsDeactivateOpen(true);
  }

  function handleCloseDeactivate() {
    setIsDeactivateOpen(false);
    setDepartmentToDeactivate(null);
  }

  async function handleSubmitDepartment(departmentData) {
    try {
      setIsSubmitting(true);
      setError("");

      if (selectedDepartment) {
        const response = await updateDepartment(
          selectedDepartment.id,
          departmentData,
        );

        setDepartments((currentDepartments) =>
          currentDepartments.map((department) =>
            department.id === selectedDepartment.id
              ? response.data
              : department,
          ),
        );
      } else {
        const response = await createDepartment(departmentData);

        setDepartments((currentDepartments) => [
          response.data,
          ...currentDepartments,
        ]);
      }

      handleCloseForm();
    } catch (error) {
      setError(error.message || "Failed to save department.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDeactivate() {
    try {
      setIsSubmitting(true);
      setError("");

      const response = await deactivateDepartment(departmentToDeactivate.id);

      setDepartments((currentDepartments) =>
        currentDepartments.map((department) =>
          department.id === departmentToDeactivate.id
            ? response.data
            : department,
        ),
      );

      handleCloseDeactivate();
    } catch (error) {
      setError(error.message || "Failed to deactivate department.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredDepartments = departments.filter((department) => {
    const searchTerm = search.trim().toLowerCase();

    const matchesSearch =
      !searchTerm ||
      department.name.toLowerCase().includes(searchTerm) ||
      department.code.toLowerCase().includes(searchTerm) ||
      department.description?.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && department.isActive) ||
      (statusFilter === "inactive" && !department.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <section>
      <PageHeader
        title="Departments"
        description="Manage departments and department information."
      />

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleAddDepartment}
          className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          + Add Department
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="department-search" className="sr-only">
            Search departments
          </label>

          <input
            id="department-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by department name, code, or description..."
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div className="sm:w-44">
          <label htmlFor="department-status" className="sr-only">
            Filter by status
          </label>

          <select
            id="department-status"
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

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-danger bg-danger-light p-4 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <section aria-label="Department list" className="mt-6">
        {isLoading ? (
          <p className="rounded-lg border border-border bg-surface p-6 text-sm text-text-secondary">
            Loading departments...
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <DepartmentTable
              departments={filteredDepartments}
              onEdit={handleEdit}
              onDeactivate={handleDeactivate}
            />
          </div>
        )}
      </section>

      {isFormOpen && (
        <Modal
          title={selectedDepartment ? "Edit Department" : "Add Department"}
          size="lg"
          onClose={handleCloseForm}
        >
          <DepartmentForm
            key={selectedDepartment?.id || "create"}
            department={selectedDepartment}
            onSubmit={handleSubmitDepartment}
            onCancel={handleCloseForm}
            isSubmitting={isSubmitting}
          />
        </Modal>
      )}

      {isDeactivateOpen && departmentToDeactivate && (
        <Modal
          title="Deactivate Department"
          size="sm"
          onClose={handleCloseDeactivate}
        >
          <div>
            <p className="text-sm text-text-secondary">
              Are you sure you want to deactivate{" "}
              <span className="font-semibold text-text">
                {departmentToDeactivate.name}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-text-muted">
              The department will remain in the system, but it will no longer be
              available for new request routing.
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

export default Departments;
