import { useEffect, useState } from "react";

import { apiRequest } from "../../services/api";
import { createClientFeedback } from "../../services/client-feedback.service";

function ClientFeedback() {
  const [fullName, setFullName] = useState("");
  const [titleId, setTitleId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");

  const [feedbackTitles, setFeedbackTitles] = useState([]);
  const [isLoadingTitles, setIsLoadingTitles] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    async function loadFeedbackTitles() {
      try {
        setIsLoadingTitles(true);
        setError("");

        const response = await apiRequest("/client-feedback-titles");

        setFeedbackTitles(response.data || []);
      } catch (error) {
        setError(error.message || "Failed to load feedback titles.");
      } finally {
        setIsLoadingTitles(false);
      }
    }

    loadFeedbackTitles();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedFullName = fullName.trim();
    const trimmedPhoneNumber = phoneNumber.trim();
    const trimmedDescription = description.trim();

    if (
      !trimmedFullName ||
      !titleId ||
      !trimmedPhoneNumber ||
      !trimmedDescription
    ) {
      setError(
        "Full name, phone number, feedback title, and description are required.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess(null);

      const response = await createClientFeedback(
        trimmedFullName,
        titleId,
        trimmedPhoneNumber,
        trimmedDescription,
      );

      setSuccess(response.data);

      setFullName("");
      setTitleId("");
      setPhoneNumber("");
      setDescription("");
    } catch (error) {
      setError(error.message || "Failed to submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface-muted px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-text">Client Feedback</h1>

          <p className="mt-2 text-sm leading-6 text-text-muted">
            We value your feedback. Please share your experience or tell us how
            we can improve our service.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8"
        >
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-danger bg-danger-light p-4 text-sm text-danger"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-6 rounded-lg border border-success bg-success-light p-4"
            >
              <p className="text-sm font-medium text-success">
                Your feedback has been submitted successfully.
              </p>

              <p className="mt-2 text-sm text-text">
                Your reference number is:
              </p>

              <p className="mt-1 text-lg font-semibold text-text">
                {success.referenceNumber}
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="feedback-full-name"
              className="block text-sm font-medium text-text"
            >
              Full Name
            </label>

            <input
              id="feedback-full-name"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter your full name"
              maxLength={200}
              disabled={isSubmitting}
              className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-1.5 text-xs text-text-muted">
              {fullName.length}/200
            </p>
          </div>

          <div className="mt-5">
            <label
              htmlFor="feedback-phone-number"
              className="block text-sm font-medium text-text"
            >
              Phone Number
            </label>

            <input
              id="feedback-phone-number"
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="Enter your phone number"
              maxLength={30}
              disabled={isSubmitting}
              className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-1.5 text-xs text-text-muted">
              {phoneNumber.length}/30
            </p>
          </div>

          <div className="mt-5">
            <label
              htmlFor="feedback-title"
              className="block text-sm font-medium text-text"
            >
              Feedback Title
            </label>

            <select
              id="feedback-title"
              value={titleId}
              onChange={(event) => setTitleId(event.target.value)}
              disabled={isSubmitting || isLoadingTitles}
              className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {isLoadingTitles
                  ? "Loading feedback titles..."
                  : "Select a feedback title"}
              </option>

              {feedbackTitles.map((title) => (
                <option key={title.id} value={title.id}>
                  {title.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            <label
              htmlFor="feedback-description"
              className="block text-sm font-medium text-text"
            >
              Description
            </label>

            <textarea
              id="feedback-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tell us about your experience, complaint, suggestion, or feedback."
              maxLength={10000}
              rows={8}
              disabled={isSubmitting}
              className="mt-2 w-full resize-y rounded-md border border-border bg-surface px-3 py-2.5 text-sm leading-6 text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-1.5 text-xs text-text-muted">
              {description.length}/10000
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || isLoadingTitles}
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default ClientFeedback;
