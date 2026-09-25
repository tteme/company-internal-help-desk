import express from "express";

import { getOverviewReportController } from "../controllers/reports.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { overviewReportValidator } from "../validators/reports.validator.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

// ============================================================
// GET OVERVIEW REPORT
// ============================================================

router.get(
  "/overview",
  authenticate,
  requirePermission("report.view"),
  overviewReportValidator,
  validate,
  getOverviewReportController,
);

export default router;
