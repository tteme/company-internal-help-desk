import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import PageHeader from "../../components/ui/PageHeader";
import ReportsSummaryCards from "../../components/reports/ReportsSummaryCards";
import RequestsOverTimeChart from "../../components/reports/RequestsOverTimeChart";
import RequestsBreakdownChart from "../../components/reports/RequestsBreakdownChart";
import SlaBreachesCard from "../../components/reports/SlaBreachesCard";
import OfficerStatsTable from "../../components/reports/OfficerStatsTable";

import { getOverviewReport } from "../../services/reports.service";

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function getPresetRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  return { start, end };
}

const PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

function Reports() {
  const [dateRange, setDateRange] = useState(() => {
    const { start, end } = getPresetRange(30);
    return [start, end];
  });
  const [startDate, endDate] = dateRange;

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReport() {
      if (!startDate || !endDate) {
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await getOverviewReport(
          toDateInputValue(startDate),
          toDateInputValue(endDate),
        );

        setReport(response.data);
      } catch (error) {
        setError(error.message || "Failed to load report data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadReport();
  }, [startDate, endDate]);

  function handlePreset(days) {
    const { start, end } = getPresetRange(days);
    setDateRange([start, end]);
  }

  return (
    <section>
      <PageHeader
        title="Reports"
        description="Overview of request volume, SLA performance, and officer activity."
      />

      <div className="mt-6 flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.days}
              type="button"
              onClick={() => handlePreset(preset.days)}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-surface-muted"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => setDateRange(update)}
          maxDate={new Date()}
          dateFormat="MMM d, yyyy"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 sm:w-64"
          placeholderText="Select date range"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-danger bg-danger-light p-4 text-sm text-danger"
        >
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="mt-6 rounded-lg border border-border bg-surface p-6 text-sm text-text-secondary">
          Loading report...
        </p>
      ) : (
        report && (
          <>
            <div className="mt-6">
              <ReportsSummaryCards summary={report.summary} />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <RequestsOverTimeChart data={report.requestsOverTime} />
              </div>

              <RequestsBreakdownChart
                title="Requests by Status"
                data={report.requestsByStatus}
                dataKey="count"
                nameKey="status"
              />

              <RequestsBreakdownChart
                title="Requests by Priority"
                data={report.requestsByPriority}
                dataKey="count"
                nameKey="priority"
              />

              <RequestsBreakdownChart
                title="Requests by Department"
                data={report.requestsByDepartment}
                dataKey="count"
                nameKey="department"
              />

              <SlaBreachesCard slaBreaches={report.slaBreaches} />
            </div>

            <div className="mt-6">
              <OfficerStatsTable officerStats={report.officerStats} />
            </div>
          </>
        )
      )}
    </section>
  );
}

export default Reports;
