import express from "express";

import {
  createClientFeedbackTitleController,
  getActiveClientFeedbackTitlesController,
  getClientFeedbackTitlesController,
  getClientFeedbackTitleByIdController,
  updateClientFeedbackTitleController,
  deactivateClientFeedbackTitleController,
} from "../controllers/client-feedback-title.controller.js";

import {
  createClientFeedbackTitleValidator,
  updateClientFeedbackTitleValidator,
  clientFeedbackTitleIdValidator,
} from "../validators/client-feedback-title.validator.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

// ============================================================
// PUBLIC - GET ACTIVE FEEDBACK TITLES
// ============================================================

router.get("/", getActiveClientFeedbackTitlesController);

// ============================================================
// ADMIN - CREATE FEEDBACK TITLE
// ============================================================

router.post(
  "/",
  authenticate,
  requirePermission("feedback.title.create"),
  createClientFeedbackTitleValidator,
  validate,
  createClientFeedbackTitleController,
);

// ============================================================
// ADMIN - GET ALL FEEDBACK TITLES
// ============================================================

router.get(
  "/admin",
  authenticate,
  requirePermission("feedback.title.view"),
  getClientFeedbackTitlesController,
);

// ============================================================
// ADMIN - GET FEEDBACK TITLE BY ID
// ============================================================

router.get(
  "/:id",
  authenticate,
  requirePermission("feedback.title.view"),
  clientFeedbackTitleIdValidator,
  validate,
  getClientFeedbackTitleByIdController,
);

// ============================================================
// ADMIN - UPDATE FEEDBACK TITLE
// ============================================================

router.patch(
  "/:id",
  authenticate,
  requirePermission("feedback.title.update"),
  clientFeedbackTitleIdValidator,
  updateClientFeedbackTitleValidator,
  validate,
  updateClientFeedbackTitleController,
);

// ============================================================
// ADMIN - DEACTIVATE FEEDBACK TITLE
// ============================================================

router.delete(
  "/:id",
  authenticate,
  requirePermission("feedback.title.delete"),
  clientFeedbackTitleIdValidator,
  validate,
  deactivateClientFeedbackTitleController,
);

export default router;
