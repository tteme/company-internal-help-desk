import { useEffect, useMemo, useState } from "react";

import Button from "../ui/Button.jsx";

import {
  getPermissions,
  updateRolePermissions,
} from "../../services/role.service.js";

// ============================================================
// PERMISSION LABELS
// ============================================================

const permissionLabels = {
  "request.create": "Create Request",
  "request.view": "View Requests",
  "request.update": "Update Request",
  "request.assign": "Assign Request",
  "request.reassign": "Reassign Request",
  "request.comment": "Comment on Request",
  "request.resolve": "Resolve Request",
  "request.confirm_resolution": "Confirm Resolution",
  "request.reject_resolution": "Reject Resolution",
  "request.close": "Close Request",
  "request.reopen": "Reopen Request",
  "request.rate": "Rate Request",
  "request.escalate": "Escalate Request",

  "user.create": "Create User",
  "user.view": "View Users",
  "user.update": "Update User",
  "user.activate": "Activate User",
  "user.deactivate": "Deactivate User",

  "department.create": "Create Department",
  "department.view": "View Departments",
  "department.update": "Update Department",
  "department.delete": "Delete Department",

  "branch.create": "Create Branch",
  "branch.view": "View Branches",
  "branch.update": "Update Branch",
  "branch.delete": "Delete Branch",

  "category.create": "Create Category",
  "category.view": "View Categories",
  "category.update": "Update Category",
  "category.delete": "Delete Category",

  "category.keyword.create": "Create Category Keyword",
  "category.keyword.view": "View Category Keywords",
  "category.keyword.update": "Update Category Keyword",
  "category.keyword.delete": "Delete Category Keyword",

  "sla.create": "Create SLA Policy",
  "sla.view": "View SLA Policies",
  "sla.update": "Update SLA Policy",
  "sla.delete": "Delete SLA Policy",

  "business_hours.view": "View Business Hours",
  "business_hours.update": "Update Business Hours",

  "knowledge.create": "Create Knowledge Article",
  "knowledge.view": "View Knowledge Articles",
  "knowledge.update": "Update Knowledge Article",
  "knowledge.publish": "Publish Knowledge Article",
  "knowledge.archive": "Archive Knowledge Article",

  "report.view": "View Reports",
  "report.export": "Export Reports",

  "feedback.view": "View Feedback",
  "feedback.assign": "Assign Feedback",
  "feedback.update": "Update Feedback",
  "feedback.add_update": "Add Feedback Update",
  "feedback.dismiss": "Dismiss Feedback",

  "notification.view": "View Notifications",
  "notification.update": "Update Notifications",

  "system.settings": "Manage System Settings",

  "role.manage": "Manage Roles",
  "permission.manage": "Manage Permissions",
};

// ============================================================
// RESOURCE LABELS
// ============================================================

const resourceLabels = {
  request: "Requests",
  user: "Users",
  department: "Departments",
  branch: "Branches",
  category: "Categories",
  sla: "SLA Policies",
  business_hours: "Business Hours",
  knowledge: "Knowledge Base",
  report: "Reports",
  feedback: "Client Feedback",
  notification: "Notifications",
  system: "System",
  role: "Roles",
  permission: "Permissions",
};

// ============================================================
// HELPERS
// ============================================================

function getPermissionLabel(permissionName) {
  return (
    permissionLabels[permissionName] ||
    permissionName
      .split(".")
      .map((part) =>
        part
          .replace(/_/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase()),
      )
      .join(" ")
  );
}

function getResourceLabel(resource) {
  return (
    resourceLabels[resource] ||
    resource
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

// ============================================================
// COMPONENT
// ============================================================

function RolePermissionManager({ role, onSaved }) {
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // LOAD PERMISSIONS
  // ==========================================================

  useEffect(() => {
    async function loadPermissions() {
      try {
        setIsLoading(true);
        setError("");
        setSuccess("");

        const response = await getPermissions();

        setPermissions(response.data);

        setSelectedPermissionIds(
          role.permissions.map((permission) => permission.id),
        );
        setHasChanges(false);
      } catch (error) {
        console.error("Failed to load permissions:", error);

        setError(error.message || "Failed to load permissions.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPermissions();
  }, [role]);

  // ==========================================================
  // GROUP PERMISSIONS
  // ==========================================================

  const groupedPermissions = useMemo(() => {
    return permissions.reduce((groups, permission) => {
      const [resource] = permission.name.split(".");

      if (!groups[resource]) {
        groups[resource] = [];
      }

      groups[resource].push(permission);

      return groups;
    }, {});
  }, [permissions]);

  // ==========================================================
  // TOGGLE PERMISSION
  // ==========================================================

  function handleTogglePermission(permissionId) {
    setSelectedPermissionIds((current) => {
      if (current.includes(permissionId)) {
        return current.filter((id) => id !== permissionId);
      }

      return [...current, permissionId];
    });

    setHasChanges(true);
    setSuccess("");
  }

  // ==========================================================
  // TOGGLE ENTIRE GROUP
  // ==========================================================

  function handleToggleGroup(resourcePermissions) {
    const groupPermissionIds = resourcePermissions.map(
      (permission) => permission.id,
    );

    const allSelected = groupPermissionIds.every((id) =>
      selectedPermissionIds.includes(id),
    );

    setSelectedPermissionIds((current) => {
      if (allSelected) {
        return current.filter((id) => !groupPermissionIds.includes(id));
      }

      return [...new Set([...current, ...groupPermissionIds])];
    });

    setHasChanges(true);
    setSuccess("");
  }

  // ==========================================================
  // SAVE
  // ==========================================================

  async function handleSave() {
    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const response = await updateRolePermissions(
        role.id,
        selectedPermissionIds,
      );

      setSuccess("Permissions updated successfully.");
      setHasChanges(false);

      if (onSaved) {
        onSaved(response.data);
      }
    } catch (error) {
      console.error("Failed to update permissions:", error);

      setError(error.message || "Failed to update permissions.");
    } finally {
      setIsSaving(false);
    }
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <div className="py-10 text-center text-sm text-text-secondary">
        Loading permissions...
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-5">
      {/* ====================================================== */}
      {/* ERROR */}
      {/* ====================================================== */}

      {error && (
        <div className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* ====================================================== */}
      {/* SUCCESS */}
      {/* ====================================================== */}

      {success && (
        <div className="rounded-md border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
          {success}
        </div>
      )}

      {/* ====================================================== */}
      {/* PERMISSION GROUPS */}
      {/* ====================================================== */}

      <div className="space-y-4">
        {Object.entries(groupedPermissions).map(
          ([resource, resourcePermissions]) => {
            const selectedCount = resourcePermissions.filter((permission) =>
              selectedPermissionIds.includes(permission.id),
            ).length;

            const allSelected = selectedCount === resourcePermissions.length;

            return (
              <section
                key={resource}
                className="rounded-lg border border-border bg-background"
              >
                {/* GROUP HEADER */}

                <div className="flex items-center justify-between border-b border-border bg-surface-muted px-4 py-3">
                  <div>
                    <h3 className="text-sm font-semibold text-text">
                      {getResourceLabel(resource)}
                    </h3>

                    <p
                      className={`mt-0.5 text-xs font-medium ${
                        selectedCount === resourcePermissions.length
                          ? "text-success"
                          : selectedCount > 0
                            ? "text-primary"
                            : "text-text-secondary"
                      }`}
                    >
                      {selectedCount} of {resourcePermissions.length} selected
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleGroup(resourcePermissions)}
                    className="rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/5 hover:text-primary-dark"
                  >
                    {allSelected ? "Clear All" : "Select All"}
                  </button>
                </div>

                {/* PERMISSIONS */}

                <div className="divide-y divide-border">
                  {resourcePermissions.map((permission) => {
                    const isChecked = selectedPermissionIds.includes(
                      permission.id,
                    );

                    return (
                      <label
                        key={permission.id}
                        className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors ${
                          isChecked ? "bg-primary/5" : "hover:bg-surface-muted"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(permission.id)}
                          className="mt-0.5 h-4 w-4 rounded border-border"
                        />

                        <div>
                          <p className="text-sm font-medium text-text">
                            {getPermissionLabel(permission.name)}
                          </p>

                          {permission.description && (
                            <p className="mt-0.5 text-xs text-text-secondary">
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          },
        )}
      </div>

      {/* ====================================================== */}
      {/* FOOTER */}
      {/* ====================================================== */}

      <div className="flex items-center justify-between border-t border-border pt-4">
        <p className="text-sm text-text-secondary">
          {selectedPermissionIds.length} permission
          {selectedPermissionIds.length !== 1 ? "s" : ""} selected
        </p>

        <Button
          type="button"
          variant="primary"
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

export default RolePermissionManager;
