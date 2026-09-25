import { useState } from "react";

function buildInitialFormData(businessHours) {
  return {
    isWorking: businessHours?.isWorking ?? true,
    startTime: businessHours?.startTime || "09:00",
    endTime: businessHours?.endTime || "17:00",
    breakStartTime: businessHours?.breakStartTime || "",
    breakEndTime: businessHours?.breakEndTime || "",
  };
}

const DAY_LABELS = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

function BusinessHoursForm({
  businessHours,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState(() =>
    buildInitialFormData(businessHours),
  );
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setSubmitError("");
  }

  function validate() {
    const nextErrors = {};

    if (formData.isWorking) {
      if (!formData.startTime) {
        nextErrors.startTime = "Start time is required.";
      }

      if (!formData.endTime) {
        nextErrors.endTime = "End time is required.";
      }

      if (
        formData.startTime &&
        formData.endTime &&
        formData.startTime >= formData.endTime
      ) {
        nextErrors.endTime = "End time must be after start time.";
      }

      const hasBreakStart = Boolean(formData.breakStartTime);
      const hasBreakEnd = Boolean(formData.breakEndTime);

      if (hasBreakStart && !hasBreakEnd) {
        nextErrors.breakEndTime =
          "Break end time is required when break start time is set.";
      }

      if (!hasBreakStart && hasBreakEnd) {
        nextErrors.breakStartTime =
          "Break start time is required when break end time is set.";
      }

      if (hasBreakStart && hasBreakEnd) {
        if (formData.breakStartTime >= formData.breakEndTime) {
          nextErrors.breakEndTime =
            "Break end time must be after break start time.";
        }

        if (
          !nextErrors.breakEndTime &&
          formData.startTime &&
          formData.endTime &&
          (formData.breakStartTime <= formData.startTime ||
            formData.breakEndTime >= formData.endTime)
        ) {
          nextErrors.breakStartTime =
            "Break time must fall within working hours.";
        }
      }
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
      isWorking: formData.isWorking,
    };

    if (formData.isWorking) {
      data.startTime = formData.startTime;
      data.endTime = formData.endTime;
      data.breakStartTime = formData.breakStartTime || null;
      data.breakEndTime = formData.breakEndTime || null;
    }

    try {
      setSubmitError("");
      await onSubmit(data);
    } catch (error) {
      setSubmitError(error.message || "Failed to update business hours.");
    }
  }

  function getFieldClass(fieldName) {
    return [
      "w-full rounded-md border bg-background px-3 py-2 text-sm text-text",
      "outline-none transition-colors",
      errors[fieldName]
        ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
        : "border-border focus:border-accent focus:ring-1 focus:ring-accent/20",
    ].join(" ");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-text-secondary">
        Editing hours for{" "}
        <span className="font-semibold text-text">
          {DAY_LABELS[businessHours?.day] || businessHours?.day}
        </span>
      </p>

      {submitError && (
        <div
          role="alert"
          className="rounded-md border border-danger bg-danger-light px-4 py-3 text-sm text-danger"
        >
          {submitError}
        </div>
      )}

      {/* Working Day Toggle */}
      <label className="flex items-center gap-2.5 rounded-md border border-border bg-background px-3 py-2.5">
        <input
          type="checkbox"
          name="isWorking"
          checked={formData.isWorking}
          onChange={handleChange}
          disabled={isSubmitting}
          className="h-4 w-4 rounded border-border text-accent focus:ring-accent/20"
        />

        <span className="text-sm font-medium text-text">
          This is a working day
        </span>
      </label>

      {formData.isWorking && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Start Time */}
            <div>
              <label
                htmlFor="startTime"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                Start Time
              </label>

              <input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                className={getFieldClass("startTime")}
                disabled={isSubmitting}
              />

              {errors.startTime && (
                <p className="mt-1 text-xs text-red-600">{errors.startTime}</p>
              )}
            </div>

            {/* End Time */}
            <div>
              <label
                htmlFor="endTime"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                End Time
              </label>

              <input
                id="endTime"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                className={getFieldClass("endTime")}
                disabled={isSubmitting}
              />

              {errors.endTime && (
                <p className="mt-1 text-xs text-red-600">{errors.endTime}</p>
              )}
            </div>

            {/* Break Start Time */}
            <div>
              <label
                htmlFor="breakStartTime"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                Break Start{" "}
                <span className="font-normal text-text-muted">(optional)</span>
              </label>

              <input
                id="breakStartTime"
                name="breakStartTime"
                type="time"
                value={formData.breakStartTime}
                onChange={handleChange}
                className={getFieldClass("breakStartTime")}
                disabled={isSubmitting}
              />

              {errors.breakStartTime && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.breakStartTime}
                </p>
              )}
            </div>

            {/* Break End Time */}
            <div>
              <label
                htmlFor="breakEndTime"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                Break End{" "}
                <span className="font-normal text-text-muted">(optional)</span>
              </label>

              <input
                id="breakEndTime"
                name="breakEndTime"
                type="time"
                value={formData.breakEndTime}
                onChange={handleChange}
                className={getFieldClass("breakEndTime")}
                disabled={isSubmitting}
              />

              {errors.breakEndTime && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.breakEndTime}
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {!formData.isWorking && (
        <p className="rounded-md border border-border bg-surface-muted px-4 py-3 text-sm text-text-muted">
          Marking this as a non-working day will clear any existing start, end,
          and break times for {DAY_LABELS[businessHours?.day]}.
        </p>
      )}

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
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export default BusinessHoursForm;
