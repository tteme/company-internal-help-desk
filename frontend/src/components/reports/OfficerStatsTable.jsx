function OfficerStatsTable({ officerStats = [] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-medium text-text">Officer Performance</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-border bg-surface-muted">
            <tr>
              <th className="px-4 py-3 font-medium text-text-muted">Officer</th>
              <th className="px-4 py-3 font-medium text-text-muted">
                Department
              </th>
              <th className="px-4 py-3 font-medium text-text-muted">
                Assigned
              </th>
              <th className="px-4 py-3 font-medium text-text-muted">
                Resolved
              </th>
              <th className="px-4 py-3 font-medium text-text-muted">
                Avg. Resolution
              </th>
              <th className="px-4 py-3 font-medium text-text-muted">
                Avg. Rating
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {officerStats.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-text-muted"
                >
                  No officer activity for this range.
                </td>
              </tr>
            ) : (
              officerStats.map((officer) => (
                <tr
                  key={officer.officerId}
                  className="transition-colors hover:bg-surface-muted/50"
                >
                  <td className="px-4 py-3 font-medium text-text">
                    {officer.officerName}
                  </td>

                  <td className="px-4 py-3 text-text-muted">
                    {officer.department}
                  </td>

                  <td className="px-4 py-3 text-text-muted">
                    {officer.assignedCount}
                  </td>

                  <td className="px-4 py-3 text-text-muted">
                    {officer.resolvedCount}
                  </td>

                  <td className="px-4 py-3 text-text-muted">
                    {officer.avgResolutionMinutes == null
                      ? "—"
                      : officer.avgResolutionMinutes < 60
                        ? `${officer.avgResolutionMinutes}m`
                        : `${(officer.avgResolutionMinutes / 60).toFixed(1)}h`}
                  </td>

                  <td className="px-4 py-3 text-text-muted">
                    {officer.avgRating == null
                      ? "—"
                      : `${officer.avgRating} / 5`}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OfficerStatsTable;
