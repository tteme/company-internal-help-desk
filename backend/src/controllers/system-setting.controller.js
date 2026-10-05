import {
  getSystemSettings,
  getSystemSettingByKey,
  updateSystemSetting,
} from "../services/system-setting.service.js";

export const getSystemSettingsController = async (req, res) => {
  try {
    const settings = await getSystemSettings();

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get system settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve system settings.",
    });
  }
};

export const getSystemSettingByKeyController = async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await getSystemSettingByKey(key);

    return res.status(200).json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error("Get system setting error:", error);

    if (error.message === "System setting not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve system setting.",
    });
  }
};

export const updateSystemSettingController = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const setting = await updateSystemSetting({
      key,
      value,
    });

    return res.status(200).json({
      success: true,
      message: "System setting updated successfully.",
      data: setting,
    });
  } catch (error) {
    console.error("Update system setting error:", error);

    if (error.message === "System setting not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "This system setting cannot be edited.") {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "Setting value must be a string." ||
      error.message === "Setting value cannot be empty." ||
      error.message === "Setting value must be a boolean." ||
      error.message === "Setting value must be a number." ||
      error.message === "Setting value must be a valid option." ||
      error.message === "Unsupported system setting type."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update system setting.",
    });
  }
};
