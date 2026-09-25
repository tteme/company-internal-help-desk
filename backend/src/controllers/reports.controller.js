import { getOverviewReport } from "../services/reports.service.js";

// ============================================================
// GET OVERVIEW REPORT
// ============================================================

export const getOverviewReportController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const report = await getOverviewReport(startDate, endDate);

    return res.status(200).json({
      success: true,
      message: "Overview report retrieved successfully.",
      data: report,
    });
  } catch (error) {
    console.error("Get overview report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve overview report.",
    });
  }
};
