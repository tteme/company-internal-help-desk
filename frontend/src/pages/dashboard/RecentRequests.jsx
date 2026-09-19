import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";

const statusLabels = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  PENDING_EMPLOYEE: "Pending Employee",
  PENDING_INFORMATION: "Pending Information",
  ESCALATED: "Escalated",
  RESOLVED: "Resolved",
  REOPENED: "Reopened",
  REJECTED: "Rejected",
  CLOSED: "Closed",
};

const statusVariants = {
  OPEN: "info",
  ASSIGNED: "info",
  IN_PROGRESS: "accent",
  PENDING_EMPLOYEE: "warning",
  PENDING_INFORMATION: "warning",
  ESCALATED: "danger",
  RESOLVED: "success",
  REOPENED: "warning",
  REJECTED: "danger",
  CLOSED: "success",
};

const priorityLabels = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const priorityVariants = {
  LOW: "neutral",
  MEDIUM: "neutral",
  HIGH: "warning",
  CRITICAL: "danger",
};

function formatRelativeTime(dateString) {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const differenceInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (differenceInSeconds < 60) {
    return "Just now";
  }

  const differenceInMinutes = Math.floor(differenceInSeconds / 60);

  if (differenceInMinutes < 60) {
    return `${differenceInMinutes} minute${
      differenceInMinutes === 1 ? "" : "s"
    } ago`;
  }

  const differenceInHours = Math.floor(differenceInMinutes / 60);

  if (differenceInHours < 24) {
    return `${differenceInHours} hour${differenceInHours === 1 ? "" : "s"} ago`;
  }

  const differenceInDays = Math.floor(differenceInHours / 24);

  return `${differenceInDays} day${differenceInDays === 1 ? "" : "s"} ago`;
}

function RecentRequests({ requests }) {
  return (
    <Card>
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-text">Recent Requests</h2>

          <p className="mt-1 text-sm text-text-secondary">
            Latest help desk requests.
          </p>
        </div>

        <a
          href="/requests"
          className="text-sm font-medium text-accent hover:text-primary"
        >
          View all
        </a>
      </header>

      {requests.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-text-secondary">
          No requests found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 font-medium text-text-secondary sm:px-5"
                >
                  Ticket
                </th>

                <th
                  scope="col"
                  className="px-4 py-3 font-medium text-text-secondary sm:px-5"
                >
                  Subject
                </th>

                <th
                  scope="col"
                  className="px-4 py-3 font-medium text-text-secondary sm:px-5"
                >
                  Status
                </th>

                <th
                  scope="col"
                  className="hidden px-5 py-3 font-medium text-text-secondary md:table-cell"
                >
                  Priority
                </th>

                <th
                  scope="col"
                  className="hidden px-5 py-3 font-medium text-text-secondary lg:table-cell"
                >
                  Updated
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {requests.map((request) => (
                <tr
                  key={request.id}
                  className="transition-colors hover:bg-surface-muted"
                >
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-text sm:px-5">
                    {request.ticketNumber}
                  </td>

                  <td className="max-w-[180px] truncate px-4 py-4 text-text-secondary sm:max-w-[280px] sm:px-5">
                    {request.title}
                  </td>

                  <td className="px-4 py-4 sm:px-5">
                    <Badge
                      variant={statusVariants[request.status] || "neutral"}
                    >
                      {statusLabels[request.status] || request.status}
                    </Badge>
                  </td>

                  <td className="hidden px-5 py-4 md:table-cell">
                    <Badge
                      variant={priorityVariants[request.priority] || "neutral"}
                    >
                      {priorityLabels[request.priority] || request.priority}
                    </Badge>
                  </td>

                  <td className="hidden whitespace-nowrap px-5 py-4 text-text-muted lg:table-cell">
                    {formatRelativeTime(request.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default RecentRequests;
