import express from "express";

import {
  getBusinessHoursController,
  getBusinessHoursByDayController,
  updateBusinessHoursController,
} from "../controllers/business-hours.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

import { requirePermission } from "../middlewares/permission.middleware.js";

import {
  businessHoursDayValidator,
  updateBusinessHoursValidator,
} from "../validators/business-hours.validator.js";

import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

// ============================================================
// BUSINESS HOURS
// ============================================================

// GET all business hours
router.get(
  "/",
  authenticate,
  requirePermission("business_hours.view"),
  getBusinessHoursController,
);

// GET business hours for a specific day
router.get(
  "/:day",
  authenticate,
  requirePermission("business_hours.view"),
  businessHoursDayValidator,
  validate,
  getBusinessHoursByDayController,
);

// UPDATE business hours for a specific day
router.patch(
  "/:day",
  authenticate,
  requirePermission("business_hours.update"),
  updateBusinessHoursValidator,
  validate,
  updateBusinessHoursController,
);

export default router;
