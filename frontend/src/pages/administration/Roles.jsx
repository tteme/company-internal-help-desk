import { useEffect, useState } from "react";

import PageHeader from "../../components/ui/PageHeader.jsx";
import Modal from "../../components/ui/Modal.jsx";
import RoleTable from "../../components/role/RoleTable.jsx";

import { getRoles, getRoleById } from "../../services/role.service.js";
import RolePermissionManager from "../../components/role/RolePermissionManager.jsx";

function Roles() {
  // ============================================================
  // STATE
  // ============================================================

  const [roles, setRoles] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [isManageOpen, setIsManageOpen] = useState(false);

  const [selectedRole, setSelectedRole] = useState(null);

  const [isRoleLoading, setIsRoleLoading] = useState(false);

  // ============================================================
  // LOAD ROLES
  // ============================================================

  useEffect(() => {
    async function loadRoles() {
      try {
        setError("");

        const response = await getRoles();

        setRoles(response.data);
      } catch (error) {
        console.error("Failed to load roles:", error);

        setError(error.message || "Failed to load roles.");
      } finally {
        setIsLoading(false);
      }
    }

    loadRoles();
  }, []);

  // ============================================================
  // MANAGE ROLE
  // ============================================================

  async function handleManageRole(role) {
    try {
      setSelectedRole(null);

      setIsManageOpen(true);

      setIsRoleLoading(true);

      setError("");

      const response = await getRoleById(role.id);

      setSelectedRole(response.data);
    } catch (error) {
      console.error("Failed to load role details:", error);

      setError(error.message || "Failed to load role details.");

      setIsManageOpen(false);
    } finally {
      setIsRoleLoading(false);
    }
  }
  // ============================================================
  // UPDATE ROLE IN TABLE AFTER PERMISSION SAVE
  // ============================================================

  function handleRoleSaved(updatedRole) {
    setSelectedRole(updatedRole);

    setRoles((currentRoles) =>
      currentRoles.map((role) =>
        role.id === updatedRole.id
          ? {
              ...role,
              permissionCount: updatedRole.permissions.length,
            }
          : role,
      ),
    );
  }
  // ============================================================
  // CLOSE MANAGE MODAL
  // ============================================================

  function handleCloseManage() {
    if (isRoleLoading) {
      return;
    }

    setIsManageOpen(false);

    setSelectedRole(null);
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section>
      {/* ====================================================== */}
      {/* PAGE HEADER */}
      {/* ====================================================== */}

      <PageHeader
        title="Roles & Permissions"
        description="Manage system roles and the permissions assigned to each role."
      />

      {/* ====================================================== */}
      {/* ERROR */}
      {/* ====================================================== */}

      {error && (
        <div className="mb-6 rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* ====================================================== */}
      {/* ROLES TABLE */}
      {/* ====================================================== */}

      <section className="overflow-hidden rounded-lg border border-border bg-surface">
        {isLoading ? (
          <div className="px-5 py-10 text-center text-sm text-text-secondary">
            Loading roles...
          </div>
        ) : roles.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-text-secondary">
            No roles found.
          </div>
        ) : (
          <RoleTable roles={roles} onManage={handleManageRole} />
        )}
      </section>

      {/* ====================================================== */}
      {/* MANAGE ROLE MODAL */}
      {/* ====================================================== */}
      {isManageOpen && (
        <Modal
          onClose={handleCloseManage}
          title={selectedRole ? `Manage ${selectedRole.name}` : "Manage Role"}
        >
          {isRoleLoading ? (
            <div className="py-10 text-center text-sm text-text-secondary">
              Loading role details...
            </div>
          ) : selectedRole ? (
            <div className="space-y-6">
              {/* ================================================== */}
              {/* ROLE INFORMATION */}
              {/* ================================================== */}

              <div className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                      Role
                    </p>

                    <p className="mt-1 text-base font-semibold text-text">
                      {selectedRole.name
                        .replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                    </p>

                    <p className="mt-1 text-sm text-text-secondary">
                      {selectedRole.description || "No description"}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-md border border-border bg-surface px-3 py-2 text-center">
                    <p className="text-xs font-medium text-text-secondary">
                      Permissions
                    </p>

                    <p className="mt-0.5 text-lg font-semibold text-text">
                      {selectedRole.permissions.length}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                    Users assigned
                  </p>

                  <p className="mt-1 text-sm font-medium text-text">
                    {selectedRole.userCount}
                  </p>
                </div>
              </div>

              {/* ================================================== */}
              {/* PERMISSIONS */}
              {/* ================================================== */}

              <div>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-text">
                      Permissions
                    </h3>

                    <p className="mt-1 text-xs text-text-secondary">
                      Select which permissions should be assigned to this role.
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-text">
                    {selectedRole.permissions.length} assigned
                  </span>
                </div>

                <RolePermissionManager
                  role={selectedRole}
                  onSaved={handleRoleSaved}
                />
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-text-secondary">
              Role information could not be loaded.
            </div>
          )}
        </Modal>
      )}
    </section>
  );
}

export default Roles;
