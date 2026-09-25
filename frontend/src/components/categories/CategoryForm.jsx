import { useState } from "react";

const emptyForm = {
  name: "",
  code: "",
  description: "",
  departmentId: "",
  isActive: true,
};

function CategoryForm({
  category,
  departments,
  onSubmit,
  onCancel,
  isSubmitting,
}) {
  const [form, setForm] = useState(() => {
    if (!category) {
      return emptyForm;
    }

    return {
      name: category.name ?? "",
      code: category.code ?? "",
      description: category.description ?? "",
      departmentId: category.departmentId ?? category.department?.id ?? "",
      isActive: category.isActive ?? true,
    };
  });

  const [errors, setErrors] = useState({});
  const isEditing = Boolean(category);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
  }

  function validate() {
    const nextErrors = {};

    const name = form.name.trim();
    const code = form.code.trim();
    const description = form.description.trim();

    if (!name) {
      nextErrors.name = "Category name is required.";
    } else if (name.length > 100) {
      nextErrors.name = "Category name must not exceed 100 characters.";
    }

    if (!code) {
      nextErrors.code = "Category code is required.";
    } else if (code.length < 2 || code.length > 20) {
      nextErrors.code = "Category code must be between 2 and 20 characters.";
    } else if (!/^[A-Za-z0-9_-]+$/.test(code)) {
      nextErrors.code =
        "Category code can only contain letters, numbers, hyphens, and underscores.";
    }

    if (!form.departmentId) {
      nextErrors.departmentId = "Department is required.";
    }

    if (description.length > 1000) {
      nextErrors.description =
        "Category description must not exceed 1000 characters.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const categoryData = {
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim() || undefined,
      departmentId: form.departmentId,
    };

    if (isEditing) {
      categoryData.isActive = form.isActive;
    }

    onSubmit(categoryData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div>
          <label
            htmlFor="category-name"
            className="block text-sm font-medium text-text"
          >
            Category Name <span className="text-danger">*</span>
          </label>

          <input
            id="category-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            maxLength={100}
            disabled={isSubmitting}
            placeholder="e.g. Network Issues"
            className={[
              "mt-2 w-full rounded-md border bg-surface px-3 py-2.5 text-sm",
              "text-text outline-none transition-colors",
              "placeholder:text-text-muted",
              "focus:border-accent focus:ring-2 focus:ring-accent/20",
              "disabled:cursor-not-allowed disabled:opacity-60",
              errors.name ? "border-danger" : "border-border",
            ].join(" ")}
          />

          {errors.name && (
            <p className="mt-1.5 text-xs text-danger">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="category-code"
            className="block text-sm font-medium text-text"
          >
            Category Code <span className="text-danger">*</span>
          </label>

          <input
            id="category-code"
            name="code"
            type="text"
            value={form.code}
            onChange={handleChange}
            maxLength={20}
            disabled={isSubmitting}
            placeholder="e.g. NET"
            className={[
              "mt-2 w-full rounded-md border bg-surface px-3 py-2.5 text-sm",
              "text-text uppercase outline-none transition-colors",
              "placeholder:text-text-muted",
              "focus:border-accent focus:ring-2 focus:ring-accent/20",
              "disabled:cursor-not-allowed disabled:opacity-60",
              errors.code ? "border-danger" : "border-border",
            ].join(" ")}
          />

          <div className="mt-1.5 flex justify-between gap-3">
            {errors.code ? (
              <p className="text-xs text-danger">{errors.code}</p>
            ) : (
              <p className="text-xs text-text-muted">
                2–20 characters: letters, numbers, hyphens, underscores.
              </p>
            )}

            <span className="shrink-0 text-xs text-text-muted">
              {form.code.length}/20
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="category-department"
            className="block text-sm font-medium text-text"
          >
            Department <span className="text-danger">*</span>
          </label>

          <select
            id="category-department"
            name="departmentId"
            value={form.departmentId}
            onChange={handleChange}
            disabled={isSubmitting}
            className={[
              "mt-2 w-full rounded-md border bg-surface px-3 py-2.5 text-sm",
              "text-text outline-none transition-colors",
              "focus:border-accent focus:ring-2 focus:ring-accent/20",
              "disabled:cursor-not-allowed disabled:opacity-60",
              errors.departmentId ? "border-danger" : "border-border",
            ].join(" ")}
          >
            <option value="">Select a department</option>

            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name} ({department.code})
              </option>
            ))}
          </select>

          {errors.departmentId && (
            <p className="mt-1.5 text-xs text-danger">{errors.departmentId}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="category-description"
            className="block text-sm font-medium text-text"
          >
            Description
          </label>

          <textarea
            id="category-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={1000}
            rows={4}
            disabled={isSubmitting}
            placeholder="Describe what types of requests belong to this category..."
            className={[
              "mt-2 w-full resize-y rounded-md border bg-surface px-3 py-2.5",
              "text-sm leading-6 text-text outline-none transition-colors",
              "placeholder:text-text-muted",
              "focus:border-accent focus:ring-2 focus:ring-accent/20",
              "disabled:cursor-not-allowed disabled:opacity-60",
              errors.description ? "border-danger" : "border-border",
            ].join(" ")}
          />

          {errors.description ? (
            <p className="mt-1.5 text-xs text-danger">{errors.description}</p>
          ) : (
            <p className="mt-1.5 text-right text-xs text-text-muted">
              {form.description.length}/1000
            </p>
          )}
        </div>

        {isEditing && (
          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-surface-muted p-3">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-border accent-accent"
            />

            <span>
              <span className="block text-sm font-medium text-text">
                Active category
              </span>

              <span className="block text-xs text-text-muted">
                Inactive categories cannot be used for new request
                classification.
              </span>
            </span>
          </label>
        )}
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
          {isSubmitting
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
              ? "Save Changes"
              : "Create Category"}
        </button>
      </div>
    </form>
  );
}

export default CategoryForm;
