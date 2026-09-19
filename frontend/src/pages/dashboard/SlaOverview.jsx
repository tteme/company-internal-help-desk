import Card from "../../components/ui/Card";

function SlaOverview({ summary }) {
  return (
    <Card>
      <header className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-text">SLA Overview</h2>

        <p className="mt-1 text-sm text-text-secondary">
          Current request SLA status.
        </p>
      </header>

      <dl
        aria-label="Current request SLA status"
        className="grid gap-4 p-5 sm:grid-cols-3"
      >
        <div className="rounded-md bg-success-light p-4">
          <dt className="text-sm font-medium text-success">On Track</dt>

          <dd className="mt-2 text-2xl font-semibold text-text">
            {summary.onTrack}
          </dd>
        </div>

        <div className="rounded-md bg-warning-light p-4">
          <dt className="text-sm font-medium text-warning">Warning</dt>

          <dd className="mt-2 text-2xl font-semibold text-text">
            {summary.warning}
          </dd>
        </div>

        <div className="rounded-md bg-danger-light p-4">
          <dt className="text-sm font-medium text-danger">Breached</dt>

          <dd className="mt-2 text-2xl font-semibold text-text">
            {summary.breached}
          </dd>
        </div>
      </dl>
    </Card>
  );
}

export default SlaOverview;
