import { Pencil, Power } from "lucide-react";

function ClientFeedbackTitleTable({ titles, onEdit, onDeactivate }) {
  if (titles.length === 0) {
    return (
      <div className="px-6 py-10 text-center">
        <p className="text-sm font-medium text-text">
          No feedback titles found.
        </p>
        <p className="mt-1 text-sm text-text-muted">
          Try adjusting your search or create a new feedback title.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left">
        <thead className="border-b border-border bg-surface-muted">
          <tr>
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Feedback Title
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
          {titles.map((title) => (
            <tr
              key={title.id}
              className="transition-colors hover:bg-surface-muted/50"
            >
              <td className="px-5 py-4">
                <p className="text-sm font-medium text-text">{title.name}</p>
              </td>

              <td className="px-5 py-4">
                <span
                  className={[
                    "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                    title.isActive
                      ? "bg-success-light text-success"
                      : "bg-surface-muted text-text-muted",
                  ].join(" ")}
                >
                  {title.isActive ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(title)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-muted hover:text-text"
                    title="Edit feedback title"
                    aria-label={`Edit ${title.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  {title.isActive && (
                    <button
                      type="button"
                      onClick={() => onDeactivate(title)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-muted hover:text-text"
                      title="Deactivate feedback title"
                      aria-label={`Deactivate ${title.name}`}
                    >
                      <Power className="h-4 w-4" />
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

export default ClientFeedbackTitleTable;
