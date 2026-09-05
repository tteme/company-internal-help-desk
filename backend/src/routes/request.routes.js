import express from "express";

import {
  createRequestController,
  getOfficerRequestsController,
  getRequestByIdController,
  startRequestController,
  addRequestCommentController,
  resolveRequestController,
  confirmOrRejectRequestController,
  escalateRequestController,
} from "../controllers/request.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import {
  requirePermission,
  requireRequestConfirmationPermission,
} from "../middlewares/permission.middleware.js";

import {
  createRequestValidator,
  updateRequestStatusValidator,
  createRequestCommentValidator,
  resolveRequestValidator,
  requestConfirmationValidator,
  escalateRequestValidator,
} from "../validators/request.validator.js";

import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  requirePermission("request.create"),
  createRequestValidator,
  validate,
  createRequestController,
);

router.get(
  "/assigned",
  authenticate,
  requirePermission("request.view"),
  getOfficerRequestsController,
);

router.patch(
  "/:id/status",
  authenticate,
  requirePermission("request.update"),
  updateRequestStatusValidator,
  validate,
  startRequestController,
);

router.post(
  "/:id/comments",
  authenticate,
  requirePermission("request.update"),
  createRequestCommentValidator,
  validate,
  addRequestCommentController,
);

router.patch(
  "/:id/resolve",
  authenticate,
  requirePermission("request.update"),
  resolveRequestValidator,
  validate,
  resolveRequestController,
);

router.patch(
  "/:id/confirmation",
  authenticate, 
  requestConfirmationValidator,
  validate,
  requireRequestConfirmationPermission,
  confirmOrRejectRequestController,
);

router.post(
  "/:id/escalate",
  authenticate,
  requirePermission("request.escalate"),
  escalateRequestValidator,
  validate,
  escalateRequestController,
);



router.get(
  "/:id",
  authenticate,
  requirePermission("request.view"),
  getRequestByIdController,
);

export default router;
