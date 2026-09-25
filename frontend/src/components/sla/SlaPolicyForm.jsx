import { useState } from "react";

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function buildInitialFormData(slaPolicy) {
  if (!slaPolicy) {
    return {
      name: "",
      description: "",
      departmentId: "",
      priority: "",
      responseTimeMinutes: "",
      resolutionTimeMinutes: "",
      warningPercentage: "80",
    };
  }

  return {
    name: slaPolicy.name || "",
    description: slaPolicy.description || "",
    departmentId: slaPolicy.departmentId || slaPolicy.department?.id || "",
    priority: slaPolicy.priority || "",
    responseTimeMinutes: String(slaPolicy.responseTimeMinutes ?? ""),
    resolutionTimeMinutes: String(slaPolicy.resolutionTimeMinutes ?? ""),
    warningPercentage: String(slaPolicy.warningPercentage ?? "80"),
  };
}

function SlaPolicyForm({
  slaPolicy = null,
  departments = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState(() =>
    buildInitialFormData(slaPolicy),
  );
  const [errors, setErrors] = useState({});

  const isEditMode = Boolean(slaPolicy);

  const availableDepartments = departments.filter(
    (department) => department.isActive,
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  }

  function validate() {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Name is required.";
    } else if (formData.name.trim().length > 100) {
      nextErrors.name = "Name must not exceed 100 characters.";
    }

    if (formData.description.trim().length > 1000) {
      nextErrors.description = "Description must not exceed 1000 characters.";
    }

    if (!formData.departmentId) {
      nextErrors.departmentId = "Department is required.";
    }

    if (!formData.priority) {
      nextErrors.priority = "Priority is required.";
    }

    const responseMinutes = Number(formData.responseTimeMinutes);
    const resolutionMinutes = Number(formData.resolutionTimeMinutes);

    if (!formData.responseTimeMinutes || responseMinutes <= 0) {
      nextErrors.responseTimeMinutes =
        "Response time must be a positive number.";
    }

    if (!formData.resolutionTimeMinutes || resolutionMinutes <= 0) {
      nextErrors.resolutionTimeMinutes =
        "Resolution time must be a positive number.";
    }

    if (
      !nextErrors.responseTimeMinutes &&
      !nextErrors.resolutionTimeMinutes &&
      resolutionMinutes < responseMinutes
    ) {
      nextErrors.resolutionTimeMinutes =
        "Resolution time should be greater than or equal to response time.";
    }

    const warningValue = Number(formData.warningPercentage);

    if (
      formData.warningPercentage !== "" &&
      (warningValue < 1 || warningValue > 100)
    ) {
      nextErrors.warningPercentage = "Warning percentage must be 1–100.";
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
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      departmentId: formData.departmentId,
      priority: formData.priority,
      responseTimeMinutes: Number(formData.responseTimeMinutes),
      resolutionTimeMinutes: Number(formData.resolutionTimeMinutes),
      warningPercentage: formData.warningPercentage
        ? Number(formData.warningPercentage)
        : 80,
    };

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
        {/* Name */}
        <div className="sm:col-span-2">
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Policy Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className={getFieldClass("name")}
            placeholder="e.g. IT Support - High Priority"
            disabled={isSubmitting}
          />

          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Department */}
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
            disabled={isSubmitting}
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

        {/* Priority */}
        <div>
          <label
            htmlFor="priority"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Priority
          </label>

          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={getFieldClass("priority")}
            disabled={isSubmitting}
          >
            <option value="">Select priority</option>

            {PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                {priority.charAt(0) + priority.slice(1).toLowerCase()}
              </option>
            ))}
          </select>

          {errors.priority && (
            <p className="mt-1 text-xs text-red-600">{errors.priority}</p>
          )}

          {isEditMode && (
            <p className="mt-1 text-xs text-text-muted">
              Each department can only have one policy per priority level.
            </p>
          )}
        </div>

        {/* Response Time */}
        <div>
          <label
            htmlFor="responseTimeMinutes"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Response Time (minutes)
          </label>

          <input
            id="responseTimeMinutes"
            name="responseTimeMinutes"
            type="number"
            min="1"
            value={formData.responseTimeMinutes}
            onChange={handleChange}
            className={getFieldClass("responseTimeMinutes")}
            placeholder="e.g. 30"
            disabled={isSubmitting}
          />

          {errors.responseTimeMinutes && (
            <p className="mt-1 text-xs text-red-600">
              {errors.responseTimeMinutes}
            </p>
          )}
        </div>

        {/* Resolution Time */}
        <div>
          <label
            htmlFor="resolutionTimeMinutes"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Resolution Time (minutes)
          </label>

          <input
            id="resolutionTimeMinutes"
            name="resolutionTimeMinutes"
            type="number"
            min="1"
            value={formData.resolutionTimeMinutes}
            onChange={handleChange}
            className={getFieldClass("resolutionTimeMinutes")}
            placeholder="e.g. 480"
            disabled={isSubmitting}
          />

          {errors.resolutionTimeMinutes && (
            <p className="mt-1 text-xs text-red-600">
              {errors.resolutionTimeMinutes}
            </p>
          )}
        </div>

        {/* Warning Percentage */}
        <div>
          <label
            htmlFor="warningPercentage"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Warning Threshold (%)
          </label>

          <input
            id="warningPercentage"
            name="warningPercentage"
            type="number"
            min="1"
            max="100"
            value={formData.warningPercentage}
            onChange={handleChange}
            className={getFieldClass("warningPercentage")}
            placeholder="80"
            disabled={isSubmitting}
          />

          {errors.warningPercentage && (
            <p className="mt-1 text-xs text-red-600">
              {errors.warningPercentage}
            </p>
          )}

          <p className="mt-1 text-xs text-text-muted">
            A warning notification is sent once this percentage of the SLA time
            has elapsed.
          </p>
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className={getFieldClass("description")}
            placeholder="Optional notes about this policy..."
            disabled={isSubmitting}
          />

          {errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? isEditMode
              ? "Saving..."
              : "Creating..."
            : isEditMode
              ? "Save Changes"
              : "Create Policy"}
        </button>
      </div>
    </form>
  );
}

export default SlaPolicyForm;
