import express from "express";

import {
  createBranchController,
  getBranchesController,
  getBranchByIdController,
  updateBranchController,
  deactivateBranchController,
} from "../controllers/branch.controller.js";

import {
  createBranchValidator,
  updateBranchValidator,
  branchIdValidator,
} from "../validators/branch.validator.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

// ============================================================
// BRANCH ROUTES
// ============================================================

// Create branch
router.post(
  "/",
  authenticate,
  requirePermission("branch.create"),
  createBranchValidator,
  validate,
  createBranchController,
);

// Get all branches
router.get(
  "/",
  authenticate,
  requirePermission("branch.view"),
  getBranchesController,
);

// Get branch by ID
router.get(
  "/:id",
  authenticate,
  requirePermission("branch.view"),
  branchIdValidator,
  validate,
  getBranchByIdController,
);

// Update branch
router.patch(
  "/:id",
  authenticate,
  requirePermission("branch.update"),
  branchIdValidator,
  updateBranchValidator,
  validate,
  updateBranchController,
);

// Deactivate branch
router.delete(
  "/:id",
  authenticate,
  requirePermission("branch.delete"),
  branchIdValidator,
  validate,
  deactivateBranchController,
);

export default router;
