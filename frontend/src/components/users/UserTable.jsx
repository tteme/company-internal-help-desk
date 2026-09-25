import { Pencil, Power } from "lucide-react";

function UserTable({
  users = [],
  onEdit,
  onDeactivate,
  onReactivate,
  onToggleAvailability,
}) {
  function getStatusBadge(user) {
    if (user.status === "PENDING") {
      return (
        <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
          PENDING
        </span>
      );
    }

    if (user.status === "ACTIVE") {
      return (
        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
          ACTIVE
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
        INACTIVE
      </span>
    );
  }

  function getAvailabilityBadge(user) {
    const isOfficerOrHead =
      user.role === "DEPARTMENT_OFFICER" || user.role === "DEPARTMENT_HEAD";

    if (user.status !== "ACTIVE" || !isOfficerOrHead) {
      return <span className="text-text-muted">—</span>;
    }

    const isAvailable = user.availability === "AVAILABLE";

    if (!onToggleAvailability) {
      return (
        <span
          className={[
            "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
            isAvailable
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700",
          ].join(" ")}
        >
          {isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
        </span>
      );
    }

    return (
      <button
        type="button"
        onClick={() => onToggleAvailability(user)}
        title={isAvailable ? "Mark as unavailable" : "Mark as available"}
        className={[
          "inline-flex cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
          isAvailable
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
        ].join(" ")}
      >
        {isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
      </button>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px] text-left text-sm">
          <thead className="border-b border-border bg-surface-muted">
            <tr>
              <th className="px-4 py-3 font-medium text-text-muted">
                Employee ID
              </th>

              <th className="px-4 py-3 font-medium text-text-muted">Name</th>

              <th className="px-4 py-3 font-medium text-text-muted">Email</th>

              <th className="px-4 py-3 font-medium text-text-muted">Phone</th>

              <th className="px-4 py-3 font-medium text-text-muted">Role</th>

              <th className="px-4 py-3 font-medium text-text-muted">Branch</th>

              <th className="px-4 py-3 font-medium text-text-muted">
                Department
              </th>

              <th className="px-4 py-3 font-medium text-text-muted">Status</th>

              <th className="px-4 py-3 font-medium text-text-muted">
                Availability
              </th>

              <th className="px-4 py-3 font-medium text-text-muted">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-10 text-center text-sm text-text-muted"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-surface-muted/50"
                >
                  {/* Employee ID */}
                  <td className="px-4 py-3 font-medium text-text">
                    {user.employeeId || "—"}
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3 text-text">
                    {user.firstName} {user.lastName}
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 text-text">{user.email || "—"}</td>

                  {/* Phone */}
                  <td className="px-4 py-3 text-text-muted">
                    {user.phone || "—"}
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3 text-text">{user.role || "—"}</td>

                  {/* Branch */}
                  <td className="px-4 py-3 text-text-muted">
                    {user.branch?.name || "—"}
                  </td>

                  {/* Department */}
                  <td className="px-4 py-3 text-text-muted">
                    {user.department?.name || "—"}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">{getStatusBadge(user)}</td>

                  {/* Availability */}
                  <td className="px-4 py-3">{getAvailabilityBadge(user)}</td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(user)}
                          title="Edit user"
                          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
                        >
                          <Pencil size={16} />
                        </button>
                      )}

                      {/* Active user — deactivate */}
                      {user.status === "ACTIVE" && onDeactivate && (
                        <button
                          type="button"
                          onClick={() => onDeactivate(user)}
                          title="Deactivate user"
                          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-danger-light hover:text-danger"
                        >
                          <Power size={16} />
                        </button>
                      )}

                      {/* Inactive user — reactivate */}
                      {user.status === "INACTIVE" && onReactivate && (
                        <button
                          type="button"
                          onClick={() => onReactivate(user)}
                          title="Reactivate user"
                          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-green-50 hover:text-green-600"
                        >
                          <Power size={16} />
                        </button>
                      )}

                      {/* Pending user */}
                      {user.status === "PENDING" && (
                        <span className="px-2.5 py-1.5 text-xs text-text-muted">
                          Awaiting activation
                        </span>
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

export default UserTable;
