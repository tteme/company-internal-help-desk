function Pagination({ page, totalPages, total, limit, onPageChange }) {
  if (total === 0) {
    return null;
  }

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="flex flex-col gap-4 border-t border-border bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-text-secondary">
        Showing{" "}
        <span className="font-medium text-text">
          {startItem}-{endItem}
        </span>{" "}
        of <span className="font-medium text-text">{total}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrevious}
          className="rounded-md border border-border px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <span className="px-2 text-sm text-text-secondary">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext}
          className="rounded-md border border-border px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;
