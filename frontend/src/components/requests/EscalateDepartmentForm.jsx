import { useState } from "react";

function EscalateDepartmentForm({
  targets = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({
    targetDepartmentId: "",
    targetCategoryId: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  const selectedDepartment = targets.find(
    (department) => department.id === formData.targetDepartmentId,
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
      // Changing the department invalidates the chosen category.
      ...(name === "targetDepartmentId" ? { targetCategoryId: "" } : {}),
    }));

    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function validate() {
    const nextErrors = {};

    if (!formData.targetDepartmentId) {
      nextErrors.targetDepartmentId = "Select a department.";
    }

    if (!formData.targetCategoryId) {
      nextErrors.targetCategoryId = "Select a category.";
    }

    const length = formData.description.trim().length;

    if (length < 10) {
      nextErrors.description =
        "Please explain the reason (at least 10 characters).";
    } else if (length > 1000) {
      nextErrors.description = "Reason must not exceed 1000 characters.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      targetDepartmentId: formData.targetDepartmentId,
      targetCategoryId: formData.targetCategoryId,
      description: formData.description.trim(),
    });
  }

  function getFieldClass(fieldName) {
    return [
      "w-full rounded-md border bg-background px-3 py-2 text-sm text-text",
      "outline-none transition-colors placeholder:text-text-muted",
      errors[fieldName]
        ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
        : "border-border focus:border-accent focus:ring-1 focus:ring-accent/20",
    ].join(" ");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
        <p className="text-sm text-blue-800">
          The request will move to the selected department's head and will no
          longer appear in your department. Its SLA clock restarts using the new
          department's policy.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="targetDepartmentId"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Department
          </label>

          <select
            id="targetDepartmentId"
            name="targetDepartmentId"
            value={formData.targetDepartmentId}
            onChange={handleChange}
            className={getFieldClass("targetDepartmentId")}
            disabled={isSubmitting}
          >
            <option value="">Select department</option>

            {targets.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>

          {errors.targetDepartmentId && (
            <p className="mt-1 text-xs text-red-600">
              {errors.targetDepartmentId}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="targetCategoryId"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Category
          </label>

          <select
            id="targetCategoryId"
            name="targetCategoryId"
            value={formData.targetCategoryId}
            onChange={handleChange}
            className={getFieldClass("targetCategoryId")}
            disabled={isSubmitting || !selectedDepartment}
          >
            <option value="">Select category</option>

            {(selectedDepartment?.categories || []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {errors.targetCategoryId && (
            <p className="mt-1 text-xs text-red-600">
              {errors.targetCategoryId}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Reason for escalation
          </label>

          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className={getFieldClass("description")}
            placeholder="Explain why this request needs to go to another department..."
            disabled={isSubmitting}
          />

          {errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description}</p>
          )}
        </div>
      </div>

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
          {isSubmitting ? "Escalating..." : "Escalate Request"}
        </button>
      </div>
    </form>
  );
}

export default EscalateDepartmentForm;
