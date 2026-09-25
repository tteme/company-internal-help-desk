import { Pencil, Power } from "lucide-react";

function BranchTable({ branches, onEdit, onDeactivate }) {
  if (branches.length === 0) {
    return (
      <div className="px-6 py-10 text-center">
        <p className="text-sm font-medium text-text">No branches found.</p>
        <p className="mt-1 text-sm text-text-muted">
          Try adjusting your search or create a new branch.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left">
        <thead className="border-b border-border bg-surface-muted">
          <tr>
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Branch
            </th>
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Code
            </th>
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Contact
            </th>
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Users
            </th>
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Status
            </th>
            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {branches.map((branch) => (
            <tr
              key={branch.id}
              className="transition-colors hover:bg-surface-muted/50"
            >
              <td className="px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-text">{branch.name}</p>

                  {branch.address && (
                    <p className="mt-0.5 max-w-xs truncate text-xs text-text-muted">
                      {branch.address}
                    </p>
                  )}
                </div>
              </td>

              <td className="px-5 py-4">
                <span className="rounded-md bg-primary-light px-2 py-1 text-xs font-medium text-primary">
                  {branch.code}
                </span>
              </td>

              <td className="px-5 py-4">
                <div className="space-y-0.5 text-sm text-text-secondary">
                  {branch.phone && <p>{branch.phone}</p>}
                  {branch.email && (
                    <p className="max-w-xs truncate text-xs">{branch.email}</p>
                  )}

                  {!branch.phone && !branch.email && (
                    <span className="text-text-muted">—</span>
                  )}
                </div>
              </td>

              <td className="px-5 py-4 text-sm text-text-secondary">
                {branch._count?.users ?? 0}
              </td>

              <td className="px-5 py-4">
                <span
                  className={[
                    "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                    branch.isActive
                      ? "bg-success-light text-success"
                      : "bg-surface-muted text-text-muted",
                  ].join(" ")}
                >
                  {branch.isActive ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(branch)}
                    aria-label={`Edit ${branch.name}`}
                    className="rounded-md p-2 text-text-muted transition-colors hover:bg-primary-light hover:text-primary"
                  >
                    <Pencil aria-hidden="true" className="h-4 w-4" />
                  </button>

                  {branch.isActive && (
                    <button
                      type="button"
                      onClick={() => onDeactivate(branch)}
                      aria-label={`Deactivate ${branch.name}`}
                      className="rounded-md p-2 text-text-muted transition-colors hover:bg-danger-light hover:text-danger"
                    >
                      <Power aria-hidden="true" className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BranchTable;
