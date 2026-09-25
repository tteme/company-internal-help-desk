import { Pencil, Power } from "lucide-react";

function formatMinutes(minutes) {
  if (minutes == null) {
    return "—";
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  if (minutes < 1440) {
    const hours = minutes / 60;
    return `${hours % 1 === 0 ? hours : hours.toFixed(1)}h`;
  }

  const days = minutes / 1440;
  return `${days % 1 === 0 ? days : days.toFixed(1)}d`;
}

function getPriorityBadge(priority) {
  const styles = {
    LOW: "bg-gray-100 text-gray-700",
    MEDIUM: "bg-blue-100 text-blue-700",
    HIGH: "bg-orange-100 text-orange-700",
    CRITICAL: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        styles[priority] || "bg-gray-100 text-gray-700",
      ].join(" ")}
    >
      {priority}
    </span>
  );
}

function SlaPolicyTable({
  slaPolicies = [],
  onEdit,
  onDeactivate,
  onReactivate,
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="border-b border-border bg-surface-muted">
            <tr>
              <th className="px-4 py-3 font-medium text-text-muted">Policy</th>
              <th className="px-4 py-3 font-medium text-text-muted">
                Department
              </th>
              <th className="px-4 py-3 font-medium text-text-muted">
                Priority
              </th>
              <th className="px-4 py-3 font-medium text-text-muted">
                Response
              </th>
              <th className="px-4 py-3 font-medium text-text-muted">
                Resolution
              </th>
              <th className="px-4 py-3 font-medium text-text-muted">Warning</th>
              <th className="px-4 py-3 font-medium text-text-muted">
                Requests
              </th>
              <th className="px-4 py-3 font-medium text-text-muted">Status</th>
              <th className="px-4 py-3 font-medium text-text-muted">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {slaPolicies.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-sm text-text-muted"
                >
                  No SLA policies found.
                </td>
              </tr>
            ) : (
              slaPolicies.map((slaPolicy) => (
                <tr
                  key={slaPolicy.id}
                  className="transition-colors hover:bg-surface-muted/50"
                >
                  {/* Policy */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-text">{slaPolicy.name}</p>

                    {slaPolicy.description && (
                      <p className="mt-0.5 truncate text-xs text-text-muted">
                        {slaPolicy.description}
                      </p>
                    )}
                  </td>

                  {/* Department */}
                  <td className="px-4 py-3 text-text-muted">
                    {slaPolicy.department?.name || "—"}
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3">
                    {getPriorityBadge(slaPolicy.priority)}
                  </td>

                  {/* Response */}
                  <td className="px-4 py-3 text-text-muted">
                    {formatMinutes(slaPolicy.responseTimeMinutes)}
                  </td>

                  {/* Resolution */}
                  <td className="px-4 py-3 text-text-muted">
                    {formatMinutes(slaPolicy.resolutionTimeMinutes)}
                  </td>

                  {/* Warning */}
                  <td className="px-4 py-3 text-text-muted">
                    {slaPolicy.warningPercentage}%
                  </td>

                  {/* Requests */}
                  <td className="px-4 py-3 text-text-muted">
                    {slaPolicy._count?.requestSlas ?? 0}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    {slaPolicy.isActive ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(slaPolicy)}
                          title="Edit policy"
                          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
                        >
                          <Pencil size={16} />
                        </button>
                      )}

                      {slaPolicy.isActive && onDeactivate && (
                        <button
                          type="button"
                          onClick={() => onDeactivate(slaPolicy)}
                          title="Deactivate policy"
                          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-danger-light hover:text-danger"
                        >
                          <Power size={16} />
                        </button>
                      )}

                      {!slaPolicy.isActive && onReactivate && (
                        <button
                          type="button"
                          onClick={() => onReactivate(slaPolicy)}
                          title="Reactivate policy"
                          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-green-50 hover:text-green-600"
                        >
                          <Power size={16} />
                        </button>
                      )}
                    </div>
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

export default SlaPolicyTable;
