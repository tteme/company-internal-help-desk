function CategoryKeywordTable({ keywords, onEdit, onDeactivate, onActivate }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left">
        <thead className="bg-surface-muted">
          <tr>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Keyword
            </th>

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Weight
            </th>

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Status
            </th>

            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {keywords.length === 0 ? (
            <tr>
              <td
                colSpan="4"
                className="px-4 py-8 text-center text-sm text-text-muted"
              >
                No keywords found.
              </td>
            </tr>
          ) : (
            keywords.map((keyword) => (
              <tr
                key={keyword.id}
                className="transition-colors hover:bg-surface-muted/50"
              >
                <td className="px-4 py-4 text-sm font-medium text-text">
                  {keyword.keyword}
                </td>

                <td className="px-4 py-4 text-sm text-text-secondary">
                  {keyword.weight}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={[
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                      keyword.isActive
                        ? "bg-success-light text-success"
                        : "bg-surface-muted text-text-muted",
                    ].join(" ")}
                  >
                    {keyword.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(keyword)}
                      className="rounded-md px-2.5 py-2 text-sm text-text-secondary transition-colors hover:bg-accent-light hover:text-accent"
                      aria-label={`Edit keyword ${keyword.keyword}`}
                    >
                      Edit
                    </button>

                    {keyword.isActive ? (
                      <button
                        type="button"
                        onClick={() => onDeactivate(keyword)}
                        className="rounded-md px-2.5 py-2 text-sm text-text-secondary transition-colors hover:bg-danger-light hover:text-danger"
                        aria-label={`Deactivate keyword ${keyword.keyword}`}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onActivate(keyword)}
                        className="rounded-md px-2.5 py-2 text-sm text-text-secondary transition-colors hover:bg-success-light hover:text-success"
                        aria-label={`Activate keyword ${keyword.keyword}`}
                      >
                        Activate
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
  );
}

export default CategoryKeywordTable;
