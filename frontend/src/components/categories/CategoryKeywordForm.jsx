import { useState } from "react";

const emptyForm = {
  keyword: "",
  weight: "",
};

function CategoryKeywordForm({ keyword, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState(() => {
    if (!keyword) {
      return emptyForm;
    }

    return {
      keyword: keyword.keyword ?? "",
      weight: keyword.weight?.toString() ?? "",
    };
  });

  const [errors, setErrors] = useState({});
  const isEditing = Boolean(keyword);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
  }

  function validate() {
    const nextErrors = {};

    const keywordValue = form.keyword.trim();

    if (!keywordValue) {
      nextErrors.keyword = "Keyword is required.";
    } else if (keywordValue.length > 100) {
      nextErrors.keyword = "Keyword must not exceed 100 characters.";
    }

    if (form.weight !== "") {
      const weight = Number(form.weight);

      if (!Number.isInteger(weight) || weight < 1 || weight > 10) {
        nextErrors.weight = "Weight must be an integer between 1 and 10.";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const keywordData = {
      keyword: form.keyword.trim(),
    };

    if (form.weight !== "") {
      keywordData.weight = Number(form.weight);
    }

    onSubmit(keywordData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div>
          <label
            htmlFor="keyword-name"
            className="block text-sm font-medium text-text"
          >
            Keyword <span className="text-danger">*</span>
          </label>

          <input
            id="keyword-name"
            name="keyword"
            type="text"
            value={form.keyword}
            onChange={handleChange}
            maxLength={100}
            disabled={isSubmitting}
            placeholder="e.g. password reset"
            className={[
              "mt-2 w-full rounded-md border bg-surface px-3 py-2.5 text-sm",
              "text-text outline-none transition-colors",
              "placeholder:text-text-muted",
              "focus:border-accent focus:ring-2 focus:ring-accent/20",
              "disabled:cursor-not-allowed disabled:opacity-60",
              errors.keyword ? "border-danger" : "border-border",
            ].join(" ")}
          />

          <div className="mt-1.5 flex justify-between gap-3">
            {errors.keyword ? (
              <p className="text-xs text-danger">{errors.keyword}</p>
            ) : (
              <p className="text-xs text-text-muted">
                Enter a word or phrase used to classify requests.
              </p>
            )}

            <span className="shrink-0 text-xs text-text-muted">
              {form.keyword.length}/100
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="keyword-weight"
            className="block text-sm font-medium text-text"
          >
            Weight
          </label>

          <input
            id="keyword-weight"
            name="weight"
            type="number"
            min="1"
            max="10"
            step="1"
            value={form.weight}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="1–10"
            className={[
              "mt-2 w-full rounded-md border bg-surface px-3 py-2.5 text-sm",
              "text-text outline-none transition-colors",
              "placeholder:text-text-muted",
              "focus:border-accent focus:ring-2 focus:ring-accent/20",
              "disabled:cursor-not-allowed disabled:opacity-60",
              errors.weight ? "border-danger" : "border-border",
            ].join(" ")}
          />

          {errors.weight ? (
            <p className="mt-1.5 text-xs text-danger">{errors.weight}</p>
          ) : (
            <p className="mt-1.5 text-xs text-text-muted">
              Optional. Higher values give the keyword more classification
              importance.
            </p>
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
          {isSubmitting
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
              ? "Save Changes"
              : "Add Keyword"}
        </button>
      </div>
    </form>
  );
}

export default CategoryKeywordForm;
