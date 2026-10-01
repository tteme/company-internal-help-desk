import { Eye } from "lucide-react";

function formatEnum(value) {
  if (!value) return "-";

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString();
}

function getPriorityClass(priority) {
  switch (priority) {
    case "HIGH":
    case "URGENT":
      return "border-danger/20 bg-danger-light text-danger";

    case "MEDIUM":
      return "border-warning/20 bg-warning-light text-warning";

    case "LOW":
      return "border-success/20 bg-success-light text-success";

    default:
      return "border-border bg-surface-muted text-text-secondary";
  }
}

function getEscalationStatusClass(status) {
  switch (status) {
    case "PENDING":
      return "border-warning/20 bg-warning-light text-warning";

    case "ACCEPTED":
    case "RESOLVED":
      return "border-success/20 bg-success-light text-success";

    default:
      return "border-border bg-surface-muted text-text-secondary";
  }
}

function EscalationTable({ requests, onView }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      {requests.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm text-text-secondary">
            No escalated requests found.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Ticket
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Request
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Priority
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Escalated By
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Reason
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Escalated At
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {requests.map((request) => {
                const escalation = request.escalations?.[0];

                return (
                  <tr
                    key={request.id}
                    className="transition-colors hover:bg-surface-muted/50"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-text">
                      {request.ticketNumber}
                    </td>

                    <td className="px-5 py-4">
                      <div className="max-w-[220px]">
                        <p className="truncate text-sm font-medium text-text">
                          {request.title}
                        </p>

                        <p className="mt-1 truncate text-xs text-text-secondary">
                          {request.category?.name || "-"}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getPriorityClass(
                          request.priority,
                        )}`}
                      >
                        {formatEnum(request.priority)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-text">
                          {escalation?.fromUser
                            ? `${escalation.fromUser.firstName} ${escalation.fromUser.lastName}`
                            : "-"}
                        </p>

                        <p className="mt-1 text-xs text-text-secondary">
                          {escalation?.fromUser?.employeeId || ""}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm text-text">
                          {formatEnum(escalation?.reason)}
                        </p>

                        {escalation?.description && (
                          <p className="mt-1 max-w-[180px] truncate text-xs text-text-secondary">
                            {escalation.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-text-secondary">
                      {formatDate(escalation?.escalatedAt)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getEscalationStatusClass(
                          escalation?.status,
                        )}`}
                      >
                        {formatEnum(escalation?.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onView(request.id)}
                        className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-muted"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EscalationTable;
