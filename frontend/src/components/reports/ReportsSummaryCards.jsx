function formatMinutes(minutes) {
  if (minutes == null) {
    return "—";
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = minutes / 60;
  return `${hours % 1 === 0 ? hours : hours.toFixed(1)}h`;
}

function StatCard({ label, value, sublabel }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-text">{value}</p>

      {sublabel && <p className="mt-1 text-xs text-text-muted">{sublabel}</p>}
    </div>
  );
}

function ReportsSummaryCards({ summary }) {
  if (!summary) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Requests" value={summary.totalRequests} />

      <StatCard label="Open" value={summary.openRequests} />

      <StatCard label="Resolved" value={summary.resolvedRequests} />

      <StatCard label="Escalated" value={summary.escalatedRequests} />

      <StatCard
        label="SLA Compliance"
        value={
          summary.slaComplianceRate == null
            ? "—"
            : `${summary.slaComplianceRate}%`
        }
      />

      <StatCard
        label="Avg. Response Time"
        value={formatMinutes(summary.avgResponseMinutes)}
      />

      <StatCard
        label="Avg. Resolution Time"
        value={formatMinutes(summary.avgResolutionMinutes)}
      />

      <StatCard
        label="Avg. Rating"
        value={summary.avgRating == null ? "—" : `${summary.avgRating} / 5`}
      />
    </div>
  );
}

export default ReportsSummaryCards;
