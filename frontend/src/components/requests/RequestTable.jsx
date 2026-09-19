import { Link } from "react-router-dom";

import Badge from "../ui/Badge";
import Card from "../ui/Card";

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

function RequestTable({ requests }) {
  return (
    <Card>
      {requests.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-text-secondary">
          No requests found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                <th
                  scope="col"
                  className="whitespace-nowrap px-5 py-3 font-medium text-text-secondary"
                >
                  Ticket
                </th>

                <th
                  scope="col"
                  className="px-5 py-3 font-medium text-text-secondary"
                >
                  Subject
                </th>

                <th
                  scope="col"
                  className="hidden px-5 py-3 font-medium text-text-secondary md:table-cell"
                >
                  Category
                </th>

                <th
                  scope="col"
                  className="px-5 py-3 font-medium text-text-secondary"
                >
                  Priority
                </th>

                <th
                  scope="col"
                  className="px-5 py-3 font-medium text-text-secondary"
                >
                  Status
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
                  <td className="whitespace-nowrap px-5 py-4">
                    <Link
                      to={`/requests/${request.id}`}
                      className="font-medium text-accent hover:text-primary"
                    >
                      {request.ticketNumber}
                    </Link>
                  </td>

                  <td className="max-w-[280px] truncate px-5 py-4 text-text">
                    {request.title}
                  </td>

                  <td className="hidden px-5 py-4 text-text-secondary md:table-cell">
                    {request.category?.name || "—"}
                  </td>

                  <td className="px-5 py-4">
                    <Badge
                      variant={priorityVariants[request.priority] || "neutral"}
                    >
                      {priorityLabels[request.priority] || request.priority}
                    </Badge>
                  </td>

                  <td className="px-5 py-4">
                    <Badge
                      variant={statusVariants[request.status] || "neutral"}
                    >
                      {statusLabels[request.status] || request.status}
                    </Badge>
                  </td>

                  <td className="hidden whitespace-nowrap px-5 py-4 text-text-muted lg:table-cell">
                    {request.updatedAt
                      ? new Date(request.updatedAt).toLocaleDateString()
                      : "—"}
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

export default RequestTable;
