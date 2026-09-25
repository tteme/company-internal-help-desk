import { useState } from "react";

function buildInitialFormData(user) {
  if (!user) {
    return {
      employeeId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      branchId: "",
      departmentId: "",
    };
  }

  return {
    employeeId: user.employeeId || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "",
    branchId: user.branch?.id || "",
    departmentId: user.department?.id || "",
  };
}

function UserForm({
  user = null,
  branches = [],
  departments = [],
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [formData, setFormData] = useState(() => buildInitialFormData(user));
  const [errors, setErrors] = useState({});

  const isEditMode = Boolean(user);

  const requiresBranch =
    formData.role === "EMPLOYEE" ||
    formData.role === "DEPARTMENT_OFFICER" ||
    formData.role === "DEPARTMENT_HEAD";

  const requiresDepartment =
    formData.role === "DEPARTMENT_OFFICER" ||
    formData.role === "DEPARTMENT_HEAD";

  // Only active branches should be available for user assignment.
  const availableBranches = branches.filter((branch) => branch.isActive);

  // Departments are centralized and are not associated with branches.
  // Therefore, only filter by active status.
  const availableDepartments = departments.filter(
    (department) => department.isActive,
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => {
      const next = {
        ...current,
        [name]: value,
      };

      if (name === "role") {
        const roleRequiresBranch =
          value === "EMPLOYEE" ||
          value === "DEPARTMENT_OFFICER" ||
          value === "DEPARTMENT_HEAD";

        const roleRequiresDepartment =
          value === "DEPARTMENT_OFFICER" || value === "DEPARTMENT_HEAD";

        if (!roleRequiresBranch) {
          next.branchId = "";
        }

        if (!roleRequiresDepartment) {
          next.departmentId = "";
        }
      }

      return next;
    });

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  }

  function validate() {
    const nextErrors = {};

    if (!formData.employeeId.trim()) {
      nextErrors.employeeId = "Employee ID is required.";
    }

    if (!formData.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!formData.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!formData.role) {
      nextErrors.role = "Role is required.";
    }

    if (requiresBranch && !formData.branchId) {
      nextErrors.branchId = "Branch is required for this role.";
    }

    if (requiresDepartment && !formData.departmentId) {
      nextErrors.departmentId = "Department is required for this role.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

    async function handleSubmit(event) {
      event.preventDefault();

      if (!validate()) {
        return;
      }

      const data = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: formData.role,
      };

      // employeeId and email are immutable after creation
      if (!isEditMode) {
        data.employeeId = formData.employeeId.trim();
        data.email = formData.email.trim();
      }

      if (formData.phone.trim()) {
        data.phone = formData.phone.trim();
      }

      if (requiresBranch) {
        data.branchId = formData.branchId;
      }

      if (requiresDepartment) {
        data.departmentId = formData.departmentId;
      }

      await onSubmit(data);
    }
  function getFieldClass(fieldName) {
    return [
      "w-full rounded-md border bg-background px-3 py-2 text-sm text-text",
      "outline-none transition-colors",
      "placeholder:text-text-muted",
      errors[fieldName]
        ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
        : "border-border focus:border-accent focus:ring-1 focus:ring-accent/20",
    ].join(" ");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Employee ID */}
        <div>
          <label
            htmlFor="employeeId"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Employee ID
          </label>

          <input
            id="employeeId"
            name="employeeId"
            type="text"
            value={formData.employeeId}
            onChange={handleChange}
            className={getFieldClass("employeeId")}
            placeholder="e.g. EMP-001"
            disabled={submitting || isEditMode}
          />

          {isEditMode && (
            <p className="mt-1 text-xs text-text-muted">
              Employee ID cannot be changed.
            </p>
          )}

          {errors.employeeId && (
            <p className="mt-1 text-xs text-red-600">{errors.employeeId}</p>
          )}

          {errors.employeeId && (
            <p className="mt-1 text-xs text-red-600">{errors.employeeId}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label
            htmlFor="role"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Role
          </label>

          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={getFieldClass("role")}
            disabled={submitting}
          >
            <option value="">Select role</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="DEPARTMENT_OFFICER">Department Officer</option>
            <option value="DEPARTMENT_HEAD">Department Head</option>
            <option value="ADMIN">Admin</option>
            <option value="SYSTEM_ADMINISTRATOR">System Administrator</option>
          </select>

          {errors.role && (
            <p className="mt-1 text-xs text-red-600">{errors.role}</p>
          )}
        </div>

        {/* First Name */}
        <div>
          <label
            htmlFor="firstName"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            First Name
          </label>

          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            className={getFieldClass("firstName")}
            placeholder="First name"
            disabled={submitting}
          />

          {errors.firstName && (
            <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="lastName"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Last Name
          </label>

          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            className={getFieldClass("lastName")}
            placeholder="Last name"
            disabled={submitting}
          />

          {errors.lastName && (
            <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={getFieldClass("email")}
            placeholder="user@example.com"
            disabled={submitting || isEditMode}
          />

          {isEditMode && (
            <p className="mt-1 text-xs text-text-muted">
              Email cannot be changed after account creation.
            </p>
          )}

          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}

          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Phone
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className={getFieldClass("phone")}
            placeholder="Phone number"
            disabled={submitting}
          />
        </div>

        {/* Branch */}
        {requiresBranch && (
          <div>
            <label
              htmlFor="branchId"
              className="mb-1.5 block text-sm font-medium text-text"
            >
              Branch
            </label>

            <select
              id="branchId"
              name="branchId"
              value={formData.branchId}
              onChange={handleChange}
              className={getFieldClass("branchId")}
              disabled={submitting}
            >
              <option value="">Select branch</option>

              {availableBranches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>

            {errors.branchId && (
              <p className="mt-1 text-xs text-red-600">{errors.branchId}</p>
            )}
          </div>
        )}

        {/* Department */}
        {requiresDepartment && (
          <div>
            <label
              htmlFor="departmentId"
              className="mb-1.5 block text-sm font-medium text-text"
            >
              Department
            </label>

            <select
              id="departmentId"
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              className={getFieldClass("departmentId")}
              disabled={submitting}
            >
              <option value="">Select department</option>

              {availableDepartments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>

            {errors.departmentId && (
              <p className="mt-1 text-xs text-red-600">{errors.departmentId}</p>
            )}
          </div>
        )}
      </div>

      {/* Invitation Information */}
      {!isEditMode && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm text-blue-800">
            An invitation email will be sent to the user's email address. The
            user must follow the invitation link to activate the account and set
            their password.
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? isEditMode
              ? "Saving..."
              : "Creating..."
            : isEditMode
              ? "Save Changes"
              : "Create User"}
        </button>
      </div>
    </form>
  );
}

export default UserForm;
