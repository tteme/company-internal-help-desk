import express from "express";

import {
  createSlaPolicyController,
  getSlaPoliciesController,
  getSlaPolicyByIdController,
  updateSlaPolicyController,
  deactivateSlaPolicyController,
} from "../controllers/sla.controller.js";

import {
  createSlaValidator,
  updateSlaValidator,
  slaIdValidator,
} from "../validators/sla.validator.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

// ============================================================
// CREATE SLA POLICY
// ============================================================

router.post(
  "/",
  authenticate,
  requirePermission("sla.create"),
  createSlaValidator,
  validate,
  createSlaPolicyController,
);

// ============================================================
// GET ALL SLA POLICIES
// ============================================================

router.get(
  "/",
  authenticate,
  requirePermission("sla.view"),
  getSlaPoliciesController,
);

// ============================================================
// GET SLA POLICY BY ID
// ============================================================

router.get(
  "/:id",
  authenticate,
  requirePermission("sla.view"),
  slaIdValidator,
  validate,
  getSlaPolicyByIdController,
);

// ============================================================
// UPDATE SLA POLICY
// ============================================================

router.patch(
  "/:id",
  authenticate,
  requirePermission("sla.update"),
  slaIdValidator,
  updateSlaValidator,
  validate,
  updateSlaPolicyController,
);

// ============================================================
// DEACTIVATE SLA POLICY
// ============================================================

router.delete(
  "/:id",
  authenticate,
  requirePermission("sla.delete"),
  slaIdValidator,
  validate,
  deactivateSlaPolicyController,
);

export default router;
