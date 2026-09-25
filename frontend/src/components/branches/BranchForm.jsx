import { useState } from "react";

const emptyForm = {
  name: "",
  code: "",
  address: "",
  phone: "",
  email: "",
  isActive: true,
};

function BranchForm({ branch, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState(() => {
    if (!branch) {
      return emptyForm;
    }

    return {
      name: branch.name ?? "",
      code: branch.code ?? "",
      address: branch.address ?? "",
      phone: branch.phone ?? "",
      email: branch.email ?? "",
      isActive: branch.isActive ?? true,
    };
  });

  const [errors, setErrors] = useState({});

  const isEditing = Boolean(branch);

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
    const address = form.address.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();

    if (!name) {
      nextErrors.name = "Branch name is required.";
    } else if (name.length > 100) {
      nextErrors.name = "Branch name must not exceed 100 characters.";
    }

    if (!code) {
      nextErrors.code = "Branch code is required.";
    } else if (code.length < 2 || code.length > 20) {
      nextErrors.code = "Branch code must be between 2 and 20 characters.";
    } else if (!/^[A-Za-z0-9_-]+$/.test(code)) {
      nextErrors.code =
        "Branch code can only contain letters, numbers, hyphens, and underscores.";
    }

    if (address.length > 255) {
      nextErrors.address = "Branch address must not exceed 255 characters.";
    }

    if (phone.length > 30) {
      nextErrors.phone = "Branch phone must not exceed 30 characters.";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Branch email must be a valid email address.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const branchData = {
      name: form.name.trim(),
      code: form.code.trim(),
      address: form.address.trim() || undefined,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
    };

    if (isEditing) {
      branchData.isActive = form.isActive;
    }

    onSubmit(branchData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div>
          <label
            htmlFor="branch-name"
            className="block text-sm font-medium text-text"
          >
            Branch Name <span className="text-danger">*</span>
          </label>

          <input
            id="branch-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            maxLength={100}
            disabled={isSubmitting}
            placeholder="e.g. Bole Branch"
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
            htmlFor="branch-code"
            className="block text-sm font-medium text-text"
          >
            Branch Code <span className="text-danger">*</span>
          </label>

          <input
            id="branch-code"
            name="code"
            type="text"
            value={form.code}
            onChange={handleChange}
            maxLength={20}
            disabled={isSubmitting}
            placeholder="e.g. BOLE"
            className={[
              "mt-2 w-full rounded-md border bg-surface px-3 py-2.5 text-sm",
              "text-text uppercase outline-none transition-colors",
              "placeholder:text-text-muted",
              "focus:border-accent focus:ring-2 focus:ring-accent/20",
              "disabled:cursor-not-allowed disabled:opacity-60",
              errors.code ? "border-danger" : "border-border",
            ].join(" ")}
          />

          <div className="mt-1.5 flex justify-between">
            {errors.code ? (
              <p className="text-xs text-danger">{errors.code}</p>
            ) : (
              <p className="text-xs text-text-muted">
                2–20 characters: letters, numbers, hyphens, underscores.
              </p>
            )}

            <span className="text-xs text-text-muted">
              {form.code.length}/20
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="branch-address"
            className="block text-sm font-medium text-text"
          >
            Address
          </label>

          <textarea
            id="branch-address"
            name="address"
            value={form.address}
            onChange={handleChange}
            maxLength={255}
            rows={3}
            disabled={isSubmitting}
            placeholder="Branch address"
            className={[
              "mt-2 w-full resize-y rounded-md border bg-surface px-3 py-2.5",
              "text-sm leading-6 text-text outline-none transition-colors",
              "placeholder:text-text-muted",
              "focus:border-accent focus:ring-2 focus:ring-accent/20",
              "disabled:cursor-not-allowed disabled:opacity-60",
              errors.address ? "border-danger" : "border-border",
            ].join(" ")}
          />

          {errors.address ? (
            <p className="mt-1.5 text-xs text-danger">{errors.address}</p>
          ) : (
            <p className="mt-1.5 text-right text-xs text-text-muted">
              {form.address.length}/255
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="branch-phone"
              className="block text-sm font-medium text-text"
            >
              Phone
            </label>

            <input
              id="branch-phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              maxLength={30}
              disabled={isSubmitting}
              placeholder="Branch phone number"
              className={[
                "mt-2 w-full rounded-md border bg-surface px-3 py-2.5",
                "text-sm text-text outline-none transition-colors",
                "placeholder:text-text-muted",
                "focus:border-accent focus:ring-2 focus:ring-accent/20",
                "disabled:cursor-not-allowed disabled:opacity-60",
                errors.phone ? "border-danger" : "border-border",
              ].join(" ")}
            />

            {errors.phone && (
              <p className="mt-1.5 text-xs text-danger">{errors.phone}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="branch-email"
              className="block text-sm font-medium text-text"
            >
              Email
            </label>

            <input
              id="branch-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              maxLength={254}
              disabled={isSubmitting}
              placeholder="branch@example.com"
              className={[
                "mt-2 w-full rounded-md border bg-surface px-3 py-2.5",
                "text-sm text-text outline-none transition-colors",
                "placeholder:text-text-muted",
                "focus:border-accent focus:ring-2 focus:ring-accent/20",
                "disabled:cursor-not-allowed disabled:opacity-60",
                errors.email ? "border-danger" : "border-border",
              ].join(" ")}
            />

            {errors.email && (
              <p className="mt-1.5 text-xs text-danger">{errors.email}</p>
            )}
          </div>
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
                Active branch
              </span>

              <span className="block text-xs text-text-muted">
                Inactive branches cannot be selected for new user assignments.
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
              : "Create Branch"}
        </button>
      </div>
    </form>
  );
}

export default BranchForm;
