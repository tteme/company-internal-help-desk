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
  getMyRequestsController,
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
  requestIdValidator,
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

router.get(
  "/my",
  authenticate,
  requirePermission("request.view"),
  getMyRequestsController,
);

router.patch(
  "/:id/status",
  authenticate,
  requirePermission("request.update"),
  updateRequestStatusValidator,
  requestIdValidator,
  validate,
  startRequestController,
);

router.post(
  "/:id/comments",
  authenticate,
  requirePermission("request.update"),
  createRequestCommentValidator,
  requestIdValidator,
  validate,
  addRequestCommentController,
);

router.patch(
  "/:id/resolve",
  authenticate,
  requirePermission("request.update"),
  resolveRequestValidator,
  requestIdValidator,
  validate,
  resolveRequestController,
);

router.patch(
  "/:id/confirmation",
  authenticate, 
  requestConfirmationValidator,
  requestIdValidator,
  validate,
  requireRequestConfirmationPermission,
  confirmOrRejectRequestController,
);

router.post(
  "/:id/escalate",
  authenticate,
  requirePermission("request.escalate"),
  escalateRequestValidator,
  requestIdValidator,
  validate,
  escalateRequestController,
);


router.get(
  "/:id",
  authenticate,
  requirePermission("request.view"),
  requestIdValidator,
  validate,
  getRequestByIdController,
);

export default router;
