import { useState } from "react";

const emptyForm = {
  name: "",
  isActive: true,
};

function ClientFeedbackTitleForm({ title, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(() => ({
    ...emptyForm,
    ...(title
      ? {
          name: title.name || "",
          isActive: title.isActive ?? true,
        }
      : {}),
  }));

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Feedback title name is required.";
    } else if (formData.name.trim().length > 100) {
      nextErrors.name = "Feedback title name must not exceed 100 characters.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      name: formData.name.trim(),
      isActive: formData.isActive,
    });
  };

  const isEditing = Boolean(title);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-medium text-text"
        >
          Feedback Title <span className="text-danger">*</span>
        </label>

        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter feedback title"
          maxLength={100}
          disabled={isSubmitting}
          className={[
            "w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-text",
            "placeholder:text-text-muted",
            "outline-none transition-colors",
            "focus:border-primary focus:ring-2 focus:ring-primary/10",
            errors.name
              ? "border-danger focus:border-danger focus:ring-danger/10"
              : "border-border",
          ].join(" ")}
        />

        {errors.name && (
          <p className="mt-1.5 text-xs text-danger">{errors.name}</p>
        )}
      </div>

      {isEditing && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            disabled={isSubmitting}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />

          <span className="text-sm text-text">Active</span>
        </label>
      )}

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Save Changes"
              : "Create Feedback Title"}
        </button>
      </div>
    </form>
  );
}

export default ClientFeedbackTitleForm;
