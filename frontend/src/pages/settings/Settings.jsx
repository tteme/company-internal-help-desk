import { useEffect, useState } from "react";

import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal";

import {
  getSystemSettings,
  updateSystemSetting,
} from "../../services/system-setting.service";

const settingCategories = [
  {
    key: "GENERAL",
    label: "General",
    description: "Configure general information about the help desk system.",
  },
  {
    key: "REQUEST",
    label: "Requests",
    description: "Configure request-related system behavior.",
  },
  {
    key: "NOTIFICATION",
    label: "Notifications",
    description: "Configure notification and communication behavior.",
  },
  {
    key: "SECURITY",
    label: "Security",
    description: "Configure system security-related settings.",
  },
  {
    key: "SYSTEM",
    label: "System",
    description: "Configure system-level behavior and operational settings.",
  },
];

function Settings() {
  const [settings, setSettings] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);

  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        setError("");

        const response = await getSystemSettings();

        setSettings(response.data || []);
      } catch (error) {
        setError(error.message || "Failed to load system settings.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  function handleEdit(setting) {
    setSelectedSetting(setting);

    if (setting.type === "BOOLEAN") {
      setEditValue(setting.value === "true");
    } else {
      setEditValue(setting.value);
    }

    setIsFormOpen(true);
  }

  function handleCloseForm() {
    if (isSubmitting) {
      return;
    }

    setIsFormOpen(false);
    setSelectedSetting(null);
    setEditValue("");
  }

  function getSettingLabel(key) {
    const labels = {
      "system.name": "System Name",
      "system.description": "System Description",
      "system.timezone": "System Timezone",
      "system.maintenanceMode": "Maintenance Mode",
    };

    return labels[key] || key;
  }

  function formatSettingValue(setting) {
    if (setting.type === "BOOLEAN") {
      return setting.value === "true" ? "Enabled" : "Disabled";
    }

    return setting.value;
  }

  function getSettingsByCategory(category) {
    return settings.filter((setting) => setting.category === category);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedSetting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      let value = editValue;

      if (selectedSetting.type === "BOOLEAN") {
        value = editValue === true;
      }

      if (selectedSetting.type === "NUMBER") {
        value = Number(editValue);
      }

      const response = await updateSystemSetting(selectedSetting.key, value);

      setSettings((currentSettings) =>
        currentSettings.map((setting) =>
          setting.key === selectedSetting.key ? response.data : setting,
        ),
      );

      handleCloseForm();
    } catch (error) {
      setError(error.message || "Failed to update system setting.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <PageHeader
        title="System Settings"
        description="Configure general system information and system behavior."
      />

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-danger bg-danger-light p-4 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <section aria-label="System settings" className="mt-6">
        {isLoading ? (
          <p className="rounded-lg border border-border bg-surface p-6 text-sm text-text-secondary">
            Loading system settings...
          </p>
        ) : (
          <div className="space-y-6">
           { /* ======================================================== SETTINGS
            BY CATEGORY ========================================================
            */}
            {settingCategories.map((category) => {
              const categorySettings = getSettingsByCategory(category.key);

              if (categorySettings.length === 0) {
                return null;
              }

              return (
                <div
                  key={category.key}
                  className="overflow-hidden rounded-lg border border-border bg-surface"
                >
                  <div className="border-b border-border px-5 py-4">
                    <h2 className="text-base font-semibold text-text">
                      {category.label}
                    </h2>

                    <p className="mt-1 text-sm text-text-muted">
                      {category.description}
                    </p>
                  </div>

                  <div className="divide-y divide-border">
                    {categorySettings.map((setting) => (
                      <div
                        key={setting.id}
                        className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-text">
                            {getSettingLabel(setting.key)}
                          </h3>

                          {setting.description && (
                            <p className="mt-1 text-sm text-text-muted">
                              {setting.description}
                            </p>
                          )}

                          <p className="mt-2 break-words text-sm text-text-secondary">
                            {formatSettingValue(setting)}
                          </p>
                        </div>

                        {setting.isEditable && (
                          <button
                            type="button"
                            onClick={() => handleEdit(setting)}
                            className="shrink-0 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-muted"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ==============================================================
          EDIT SETTING MODAL
          ============================================================== */}

      {isFormOpen && selectedSetting && (
        <Modal
          title={`Edit ${getSettingLabel(selectedSetting.key)}`}
          size="md"
          onClose={handleCloseForm}
        >
          <form onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="setting-value"
                className="block text-sm font-medium text-text"
              >
                Value
              </label>

              {/* ======================================================
                  BOOLEAN
                  ====================================================== */}

              {selectedSetting.type === "BOOLEAN" ? (
                <select
                  id="setting-value"
                  value={editValue ? "true" : "false"}
                  onChange={(event) =>
                    setEditValue(event.target.value === "true")
                  }
                  className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              ) : selectedSetting.key === "system.timezone" ? (
                /* ======================================================
                   TIMEZONE
                   ====================================================== */

                <select
                  id="setting-value"
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>

                  <option value="Africa/Nairobi">Africa/Nairobi</option>

                  <option value="Africa/Kampala">Africa/Kampala</option>

                  <option value="Africa/Dar_es_Salaam">
                    Africa/Dar_es_Salaam
                  </option>

                  <option value="UTC">UTC</option>
                </select>
              ) : selectedSetting.key === "system.description" ? (
                /* ======================================================
                   DESCRIPTION
                   ====================================================== */

                <textarea
                  id="setting-value"
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  rows={4}
                  className="mt-2 w-full resize-y rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              ) : (
                /* ======================================================
                   STRING / NUMBER
                   ====================================================== */

                <input
                  id="setting-value"
                  type={selectedSetting.type === "NUMBER" ? "number" : "text"}
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              )}

              {selectedSetting.description && (
                <p className="mt-2 text-sm text-text-muted">
                  {selectedSetting.description}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseForm}
                disabled={isSubmitting}
                className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

export default Settings;
