import { apiRequest } from "./api";

async function getSystemSettings() {
  return apiRequest("/system-settings");
}

async function getSystemSettingByKey(key) {
  return apiRequest(`/system-settings/${key}`);
}

async function updateSystemSetting(key, value) {
  return apiRequest(`/system-settings/${key}`, {
    method: "PATCH",
    body: JSON.stringify({ value }),
  });
}

export { getSystemSettings, getSystemSettingByKey, updateSystemSetting };
