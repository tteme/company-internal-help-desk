import { useEffect, useState } from "react";

import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal";
import BusinessHoursTable from "../../components/business-hours/BusinessHoursTable";
import BusinessHoursForm from "../../components/business-hours/BusinessHoursForm";

import {
  getBusinessHours,
  updateBusinessHours,
} from "../../services/business-hours.service";

function BusinessHours() {
  const [businessHours, setBusinessHours] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    async function loadBusinessHours() {
      try {
        setIsLoading(true);
        setError("");

        const response = await getBusinessHours();

        setBusinessHours(response.data || []);
      } catch (error) {
        setError(error.message || "Failed to load business hours.");
      } finally {
        setIsLoading(false);
      }
    }

    loadBusinessHours();
  }, []);

  function handleEdit(day) {
    setSelectedDay(day);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    if (isSubmitting) {
      return;
    }

    setIsFormOpen(false);
    setSelectedDay(null);
  }

  async function handleSubmit(data) {
    setIsSubmitting(true);

    try {
      const response = await updateBusinessHours(selectedDay.day, data);

      setBusinessHours((current) =>
        current.map((day) =>
          day.day === selectedDay.day ? response.data : day,
        ),
      );

      handleCloseForm();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <PageHeader
        title="Business Hours"
        description="Configure working hours and breaks for each day of the week."
      />

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-danger bg-danger-light p-4 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <section aria-label="Business hours list" className="mt-6">
        {isLoading ? (
          <p className="rounded-lg border border-border bg-surface p-6 text-sm text-text-secondary">
            Loading business hours...
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <BusinessHoursTable
              businessHours={businessHours}
              onEdit={handleEdit}
            />
          </div>
        )}
      </section>

      {isFormOpen && selectedDay && (
        <Modal title="Edit Business Hours" size="lg" onClose={handleCloseForm}>
          <BusinessHoursForm
            businessHours={selectedDay}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isSubmitting={isSubmitting}
          />
        </Modal>
      )}
    </section>
  );
}

export default BusinessHours;
