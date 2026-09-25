import { useEffect, useMemo, useState } from "react";

import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal";
import UserTable from "../../components/users/UserTable";
import UserForm from "../../components/users/UserForm";

import {
  getUsers,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser,
  updateUserAvailability,
} from "../../services/user.service";

import { getBranches } from "../../services/branch.service";
import { getDepartments } from "../../services/department.service";

function Users() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState(null);

  useEffect(() => {
    async function loadUsersPageData() {
      try {
        setIsLoading(true);
        setError("");

        const [usersResponse, branchesResponse, departmentsResponse] =
          await Promise.all([getUsers(), getBranches(), getDepartments()]);

        setUsers(usersResponse.data || []);
        setBranches(branchesResponse.data || []);
        setDepartments(departmentsResponse.data || []);
      } catch (error) {
        console.error("Failed to load users page data:", error);
        setError(error.message || "Failed to load users page data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadUsersPageData();
  }, []);

  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  }

  function handleRoleFilterChange(event) {
    setRoleFilter(event.target.value);
    setCurrentPage(1);
  }

  function handleStatusFilterChange(event) {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  }

  function handleAvailabilityFilterChange(event) {
    setAvailabilityFilter(event.target.value);
    setCurrentPage(1);
  }

  function handleAddUser() {
    setSelectedUser(null);
    setFormError("");
    setSuccessMessage("");
    setIsFormOpen(true);
  }

  function handleEditUser(user) {
    setSelectedUser(user);
    setFormError("");
    setSuccessMessage("");
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    if (isSubmitting) {
      return;
    }

    setIsFormOpen(false);
    setSelectedUser(null);
    setFormError("");
  }

  function handleRequestDeactivate(user) {
    setUserToDeactivate(user);
    setIsDeactivateOpen(true);
  }

  function handleCloseDeactivate() {
    if (isSubmitting) {
      return;
    }

    setIsDeactivateOpen(false);
    setUserToDeactivate(null);
  }

  async function handleSubmitUser(userData) {
    try {
      setIsSubmitting(true);
      setFormError("");
      setSuccessMessage("");

      if (selectedUser) {
        const response = await updateUser(selectedUser.id, userData);

        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.id === selectedUser.id ? response.data : user,
          ),
        );

        setSuccessMessage("User updated successfully.");
      } else {
        const response = await createUser(userData);

        setUsers((currentUsers) => [response.data, ...currentUsers]);

        setSuccessMessage(
          `User created successfully. An invitation email has been sent to ${userData.email}.`,
        );
      }

      setIsFormOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to save user:", error);
      setFormError(error.message || "Failed to save user.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDeactivate() {
    try {
      setIsSubmitting(true);
      setError("");

      const response = await deactivateUser(userToDeactivate.id);

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userToDeactivate.id ? response.data : user,
        ),
      );

      handleCloseDeactivate();
    } catch (error) {
      console.error("Failed to deactivate user:", error);
      setError(error.message || "Failed to deactivate user.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReactivate(user) {
    try {
      setIsSubmitting(true);
      setError("");

      const response = await reactivateUser(user.id);

      setUsers((currentUsers) =>
        currentUsers.map((current) =>
          current.id === user.id ? response.data : current,
        ),
      );
    } catch (error) {
      console.error("Failed to reactivate user:", error);
      setError(error.message || "Failed to reactivate user.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleAvailability(user) {
    const nextAvailability =
      user.availability === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";

    try {
      setError("");

      const response = await updateUserAvailability(user.id, nextAvailability);

      setUsers((currentUsers) =>
        currentUsers.map((current) =>
          current.id === user.id ? response.data : current,
        ),
      );
    } catch (error) {
      console.error("Failed to update availability:", error);
      setError(error.message || "Failed to update availability.");
    }
  }

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          user.employeeId,
          user.firstName,
          user.lastName,
          user.email,
          user.phone,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(normalizedSearch),
        );

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" || user.status === statusFilter;

      const matchesAvailability =
        availabilityFilter === "ALL" ||
        user.availability === availabilityFilter;

      return (
        matchesSearch && matchesRole && matchesStatus && matchesAvailability
      );
    });
  }, [users, searchTerm, roleFilter, statusFilter, availabilityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, currentPage]);

  const rangeStart =
    filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filteredUsers.length);

  function handlePreviousPage() {
    setCurrentPage((page) => Math.max(1, page - 1));
  }

  function handleNextPage() {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }

  return (
    <section>
      <PageHeader
        title="Users"
        description="Manage system users, account status, and availability."
      />

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleAddUser}
          className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          + Add User
        </button>
      </div>

      {successMessage && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {!isLoading && !error && (
        <div className="mt-6 rounded-lg border border-border bg-surface p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label
                htmlFor="user-search"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                Search
              </label>

              <input
                id="user-search"
                type="search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by ID, name, email, or phone..."
                className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div>
              <label
                htmlFor="role-filter"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                Role
              </label>

              <select
                id="role-filter"
                value={roleFilter}
                onChange={handleRoleFilterChange}
                className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                <option value="ALL">All roles</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="DEPARTMENT_OFFICER">Department Officer</option>
                <option value="DEPARTMENT_HEAD">Department Head</option>
                <option value="ADMIN">Admin</option>
                <option value="SYSTEM_ADMINISTRATOR">
                  System Administrator
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="status-filter"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                Account Status
              </label>

              <select
                id="status-filter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                <option value="ALL">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="availability-filter"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                Availability
              </label>

              <select
                id="availability-filter"
                value={availabilityFilter}
                onChange={handleAvailabilityFilterChange}
                className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                <option value="ALL">All availability</option>
                <option value="AVAILABLE">Available</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <section aria-label="User list" className="mt-6">
        {isLoading ? (
          <p className="rounded-lg border border-border bg-surface p-6 text-sm text-text-secondary">
            Loading users...
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
            <UserTable
              users={paginatedUsers}
              onEdit={handleEditUser}
              onDeactivate={handleRequestDeactivate}
              onReactivate={handleReactivate}
              onToggleAvailability={handleToggleAvailability}
            />

            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-text-muted">
                Showing{" "}
                <span className="font-medium text-text">
                  {rangeStart}-{rangeEnd}
                </span>{" "}
                of{" "}
                <span className="font-medium text-text">
                  {filteredUsers.length}
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
          title={selectedUser ? "Edit User" : "Add User"}
          size="xl"
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

          <UserForm
            key={selectedUser?.id || "create"}
            user={selectedUser}
            branches={branches}
            departments={departments}
            onSubmit={handleSubmitUser}
            onCancel={handleCloseForm}
            submitting={isSubmitting}
          />
        </Modal>
      )}

      {isDeactivateOpen && userToDeactivate && (
        <Modal
          title="Deactivate User"
          size="sm"
          onClose={handleCloseDeactivate}
        >
          <div>
            <p className="text-sm text-text-secondary">
              Are you sure you want to deactivate{" "}
              <span className="font-semibold text-text">
                {userToDeactivate.firstName} {userToDeactivate.lastName}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-text-muted">
              The user will no longer be able to log in, but their account and
              history will remain in the system.
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

export default Users;
