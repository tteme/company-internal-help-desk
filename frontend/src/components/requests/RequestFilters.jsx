function RequestFilters({
  search,
  status,
  priority,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label
            htmlFor="request-search"
            className="mb-2 block text-sm font-medium text-text"
          >
            Search requests
          </label>

          <input
            id="request-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by ticket, title, or description..."
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div>
          <label
            htmlFor="request-status"
            className="mb-2 block text-sm font-medium text-text"
          >
            Status
          </label>

          <select
            id="request-status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PENDING_EMPLOYEE">Pending Employee</option>
            <option value="PENDING_INFORMATION">Pending Information</option>
            <option value="ESCALATED">Escalated</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REOPENED">Reopened</option>
            <option value="REJECTED">Rejected</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="request-priority"
            className="mb-2 block text-sm font-medium text-text"
          >
            Priority
          </label>

          <select
            id="request-priority"
            value={priority}
            onChange={(event) => onPriorityChange(event.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default RequestFilters;
