import { getOverviewReport } from "../services/reports.service.js";

// ============================================================
// GET OVERVIEW REPORT
// ============================================================

export const getOverviewReportController = async (req, res) => {
  try {
    // Only the date range comes from the client.
    // The department scope is NEVER read from the query string
    // or body: it is decided here from the authenticated user.
    const { startDate, endDate } = req.query;

    let departmentId = null;

    if (req.user.role === "DEPARTMENT_HEAD") {
      // A head without a department must not fall through to
      // company-wide data, so refuse instead of returning everything.
      if (!req.user.departmentId) {
        return res.status(403).json({
          success: false,
          message: "Your account is not assigned to a department.",
        });
      }

      departmentId = req.user.departmentId;
    }

    const report = await getOverviewReport(startDate, endDate, departmentId);

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
