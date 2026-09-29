import express from "express";

import {
  createClientFeedbackController,
  getClientFeedbacksController,
  getClientFeedbackByIdController,
  assignClientFeedbackController,
  addClientFeedbackUpdateController,
  updateClientFeedbackStatusController,
} from "../controllers/clientFeedback.controller.js";

import {
  createClientFeedbackValidator,
  clientFeedbackIdValidator,
  assignClientFeedbackValidator,
  updateClientFeedbackStatusValidator,
  addClientFeedbackUpdateValidator,
} from "../validators/clientFeedback.validator.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

// ============================================================
// PUBLIC CLIENT FEEDBACK SUBMISSION
// ============================================================

router.post(
  "/",
  createClientFeedbackValidator,
  validate,
  createClientFeedbackController,
);

// ============================================================
// GET ALL CLIENT FEEDBACK
// ============================================================

router.get(
  "/",
  authenticate,
  requirePermission("feedback.view"),
  getClientFeedbacksController,
);

// ============================================================
// ASSIGN CLIENT FEEDBACK
// ============================================================

router.patch(
  "/:id/assign",
  authenticate,
  requirePermission("feedback.assign"),
  assignClientFeedbackValidator,
  validate,
  assignClientFeedbackController,
);
// UPDATE CLIENT FEEDBACK STATUS
router.patch(
  "/:id/status",
  authenticate,
  requirePermission("feedback.update"),
  updateClientFeedbackStatusValidator,
  validate,
  updateClientFeedbackStatusController,
);
// ADD INTERNAL UPDATE
router.post(
  "/:id/updates",
  authenticate,
  requirePermission("feedback.add_update"),
  addClientFeedbackUpdateValidator,
  validate,
  addClientFeedbackUpdateController,
);

// ============================================================
// GET CLIENT FEEDBACK BY ID
// ============================================================

router.get(
  "/:id",
  authenticate,
  requirePermission("feedback.view"),
  clientFeedbackIdValidator,
  validate,
  getClientFeedbackByIdController,
);

export default router;
