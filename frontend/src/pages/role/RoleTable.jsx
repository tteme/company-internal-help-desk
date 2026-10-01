function formatRoleName(roleName) {
  return roleName
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function RoleTable({ roles, onManage }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-background">
          <tr>
            <th className="whitespace-nowrap px-5 py-3 font-medium text-text-secondary">
              Role
            </th>

            <th className="px-5 py-3 font-medium text-text-secondary">
              Description
            </th>

            <th className="px-5 py-3 font-medium text-text-secondary">Users</th>

            <th className="px-5 py-3 font-medium text-text-secondary">
              Permissions
            </th>

            <th className="whitespace-nowrap px-5 py-3 text-right font-medium text-text-secondary">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {roles.map((role) => (
            <tr
              key={role.id}
              className="transition-colors hover:bg-surface-muted"
            >
              <td className="px-5 py-4">
                <span className="inline-flex items-center rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-text">
                  {formatRoleName(role.name)}
                </span>
              </td>

              <td className="max-w-md px-5 py-4 text-text-secondary">
                {role.description || "No description"}
              </td>

              <td className="px-5 py-4">
                <span className="text-sm font-medium text-text">
                  {role.userCount}
                </span>
              </td>

              <td className="px-5 py-4">
                <span className="text-sm font-medium text-text">
                  {role.permissionCount}
                </span>
              </td>

              <td className="px-5 py-4 text-right">
                <button
                  type="button"
                  onClick={() => onManage(role)}
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RoleTable;
