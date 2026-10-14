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
  rateRequestController,
  getRequestsController,
  assignRequestController,
  escalateRequestToDepartmentController,
  getEscalationTargetsController,
} from "../controllers/request.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

import {
  requirePermission,
  requireRequestConfirmationPermission,
  requireAssignmentPermission,
} from "../middlewares/permission.middleware.js";

import {
  createRequestValidator,
  updateRequestStatusValidator,
  createRequestCommentValidator,
  resolveRequestValidator,
  requestConfirmationValidator,
  escalateRequestValidator,
  requestIdValidator,
  requestRatingValidator,
  getRequestsQueryValidator,
  assignRequestValidator,
  escalateToDepartmentValidator,
} from "../validators/request.validator.js";

import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();



// Create a new help desk request.
// Employee creates the request; the backend determines the category,
// department, officer assignment, and SLA.
router.post(
  "/",
  authenticate,
  requirePermission("request.create"),
  createRequestValidator,
  validate,
  createRequestController,
);


// Get all requests available to the authenticated user according
// to the controller's access rules.
router.get(
  "/",
  authenticate,
  requirePermission("request.view"),
  getRequestsQueryValidator,
  validate,
  getRequestsController,
);

// Get requests currently assigned to the authenticated officer.
// Primarily used by Department Officers to see their workload.
router.get(
  "/assigned",
  authenticate,
  requirePermission("request.view"),
  getOfficerRequestsController,
);

// Get requests created by the authenticated employee.
// Primarily used by Employees to track their own requests.
router.get(
  "/my",
  authenticate,
  requirePermission("request.view"),
  getMyRequestsController,
);

router.get(
  "/escalation-targets",
  authenticate,
  requirePermission("request.escalate_department"),
  getEscalationTargetsController,
);


// Get a single request by ID.
// Used when an actor opens/views the request details.
// This is also the endpoint that can trigger the Department Head's
// first-view acceptance logic if that behavior is implemented
// inside the request-detail service.
router.get(
  "/:id",
  authenticate,
  requirePermission("request.view"),
  requestIdValidator,
  validate,
  getRequestByIdController,
);

/*
|--------------------------------------------------------------------------
| REQUEST WORKFLOW
|--------------------------------------------------------------------------
*/

// Start working on an assigned request.
// Expected transition:
// ASSIGNED → IN_PROGRESS
//
// For Department Officers, this represents starting/reviewing
// the assigned request before manual escalation or resolution.
router.patch(
  "/:id/status",
  authenticate,
  requirePermission("request.update"),
  updateRequestStatusValidator,
  requestIdValidator,
  validate,
  startRequestController,
);

 // Manually assign or reassign a request to a Department Officer.
router.patch(
  "/:id/assign",
  authenticate,
  requestIdValidator,
  assignRequestValidator,
  validate,
  requireAssignmentPermission,
  assignRequestController,
);

// Add a comment to a request.
// Used for communication between employees and support staff.
router.post(
  "/:id/comments",
  authenticate,
  requirePermission("request.update"),
  createRequestCommentValidator,
  requestIdValidator,
  validate,
  addRequestCommentController,
);

// Resolve a request.
// The support officer or Department Head provides the resolution
// message and marks the request as resolved.
router.patch(
  "/:id/resolve",
  authenticate,
  requirePermission("request.update"),
  resolveRequestValidator,
  requestIdValidator,
  validate,
  resolveRequestController,
);

/*
|--------------------------------------------------------------------------
| EMPLOYEE RESOLUTION CONFIRMATION
|--------------------------------------------------------------------------
*/

// Employee confirms or rejects a proposed resolution.
//
// CONFIRM requires:
// request.confirm_resolution
//
// REJECT requires:
// request.reject_resolution
//
// The middleware determines the required permission dynamically
// based on the decision sent in the request body.
router.patch(
  "/:id/confirmation",
  authenticate,
  requestConfirmationValidator,
  requestIdValidator,
  validate,
  requireRequestConfirmationPermission,
  confirmOrRejectRequestController,
);

/*
|--------------------------------------------------------------------------
| REQUEST ESCALATION
|--------------------------------------------------------------------------
*/

// Manually escalate a request to the appropriate Department Head.
//
// The officer provides the escalation reason and description.
// The backend automatically finds the active Department Head
// for the request's department.
router.post(
  "/:id/escalate",
  authenticate,
  requirePermission("request.escalate"),
  escalateRequestValidator,
  requestIdValidator,
  validate,
  escalateRequestController,
);

router.post(
  "/:id/escalate-department",
  authenticate,
  requirePermission("request.escalate_department"),
  escalateToDepartmentValidator,
  requestIdValidator,
  validate,
  escalateRequestToDepartmentController,
);
/*
|--------------------------------------------------------------------------
| REQUEST RATING
|--------------------------------------------------------------------------
*/

// Employee rates the support received after the request is resolved.
router.post(
  "/:id/rating",
  authenticate,
  requirePermission("request.rate"),
  requestRatingValidator,
  requestIdValidator,
  validate,
  rateRequestController,
);

export default router;
