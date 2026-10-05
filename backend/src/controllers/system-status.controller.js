import { getSystemStatus } from "../services/system-status.service.js";

export const getSystemStatusController = async (req, res) => {
  try {
    const status = await getSystemStatus();

    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Get system status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve system status.",
    });
  }
};
