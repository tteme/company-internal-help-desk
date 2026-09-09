import express from "express";

import {
  createDepartmentController,
  getDepartmentsController,
  getDepartmentByIdController,
  updateDepartmentController,
  deactivateDepartmentController,
} from "../controllers/department.controller.js";

import {
  createDepartmentValidator,
  updateDepartmentValidator,
  departmentIdValidator,
} from "../validators/department.validator.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

// ============================================================
// DEPARTMENT ROUTES
// ============================================================

// Create department
router.post(
  "/",
  authenticate,
  requirePermission("department.create"),
  createDepartmentValidator,
  validate,
  createDepartmentController,
);

// Get all departments
router.get(
  "/",
  authenticate,
  requirePermission("department.view"),
  getDepartmentsController,
);

// Get department by ID
router.get(
  "/:id",
  authenticate,
  requirePermission("department.view"),
  departmentIdValidator,
  validate,
  getDepartmentByIdController,
);

// Update department
router.patch(
  "/:id",
  authenticate,
  requirePermission("department.update"),
  departmentIdValidator,
  updateDepartmentValidator,
  validate,
  updateDepartmentController,
);

// Deactivate department
router.delete(
  "/:id",
  authenticate,
  requirePermission("department.delete"),
  departmentIdValidator,
  validate,
  deactivateDepartmentController,
);

export default router;
