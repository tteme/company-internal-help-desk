import {
  getBusinessHours,
  getBusinessHoursByDay,
  updateBusinessHours,
} from "../services/business-hours.service.js";

// ============================================================
// GET ALL BUSINESS HOURS
// ============================================================

export const getBusinessHoursController = async (req, res) => {
  try {
    const businessHours = await getBusinessHours();

    return res.status(200).json({
      success: true,
      data: businessHours,
    });
  } catch (error) {
    console.error("Get business hours error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve business hours.",
    });
  }
};

// ============================================================
// GET BUSINESS HOURS BY DAY
// ============================================================

export const getBusinessHoursByDayController = async (req, res) => {
  try {
    const { day } = req.params;

    const businessHours = await getBusinessHoursByDay(day);

    if (!businessHours) {
      return res.status(404).json({
        success: false,
        message: "Business hours configuration not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: businessHours,
    });
  } catch (error) {
    console.error("Get business hours by day error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve business hours.",
    });
  }
};

// ============================================================
// UPDATE BUSINESS HOURS
// ============================================================

export const updateBusinessHoursController = async (req, res) => {
  try {
    const { day } = req.params;

    const updatedBusinessHours = await updateBusinessHours(day, req.body);

    return res.status(200).json({
      success: true,
      message: "Business hours updated successfully.",
      data: updatedBusinessHours,
    });
  } catch (error) {
    console.error("Update business hours error:", error);

    if (
      error.message === "Business hours configuration not found." ||
      error.message === "No business hours fields were provided for update." ||
      error.message ===
        "Break end time is required when break start time is provided." ||
      error.message ===
        "Break start time is required when break end time is provided." ||
      error.message === "Break start time must be before break end time." ||
      error.message === "Break time must fall within business hours." ||
      error.message === "Start time must be before end time."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update business hours.",
    });
  }
};
