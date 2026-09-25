function SlaBreachesCard({ slaBreaches }) {
  if (!slaBreaches) {
    return null;
  }

  const { responseBreached, resolutionBreached, totalEvaluated } = slaBreaches;

  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <h3 className="text-sm font-medium text-text">SLA Breaches</h3>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Response breaches</span>

          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
            {responseBreached}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            Resolution breaches
          </span>

          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
            {resolutionBreached}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm text-text-secondary">Total evaluated</span>

          <span className="text-sm font-medium text-text">
            {totalEvaluated}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SlaBreachesCard;
