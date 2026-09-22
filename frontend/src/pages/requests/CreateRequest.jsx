import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/ui/PageHeader";
import { createRequest } from "../../services/request.service";

function CreateRequest() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      setError("Title and description are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await createRequest(trimmedTitle, trimmedDescription);

      navigate(`/requests/${response.data.id}`);
    } catch (error) {
      setError(error.message || "Failed to create request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/requests");
  }

  return (
    <section>
      <PageHeader
        title="Create Request"
        description="Submit a help desk request to the appropriate department."
      />

      <div className="mt-6 max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-border bg-surface p-6 shadow-sm"
        >
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-danger bg-danger-light p-4 text-sm text-danger"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="request-title"
              className="block text-sm font-medium text-text"
            >
              Title
            </label>

            <input
              id="request-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Briefly describe your issue"
              maxLength={200}
              disabled={isSubmitting}
              className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-1.5 text-xs text-text-muted">{title.length}/200</p>
          </div>

          <div className="mt-5">
            <label
              htmlFor="request-description"
              className="block text-sm font-medium text-text"
            >
              Description
            </label>

            <textarea
              id="request-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the problem in detail so the support officer can understand it."
              maxLength={10000}
              rows={7}
              disabled={isSubmitting}
              className="mt-2 w-full resize-y rounded-md border border-border bg-surface px-3 py-2.5 text-sm leading-6 text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-1.5 text-xs text-text-muted">
              {description.length}/10000
            </p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
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
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default CreateRequest;
