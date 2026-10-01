import express from "express";

import {
  getRolesController,
  getRoleByIdController,
  getPermissionsController,
  updateRolePermissionsController,
} from "../controllers/role.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

const router = express.Router();

// ============================================================
// ROLE MANAGEMENT
// ============================================================

// Get all roles
router.get(
  "/",
  authenticate,
  requirePermission("role.manage"),
  getRolesController,
);

// Get all available permissions
router.get(
  "/permissions",
  authenticate,
  requirePermission("role.manage"),
  getPermissionsController,
);

// Get role by ID
router.get(
  "/:id",
  authenticate,
  requirePermission("role.manage"),
  getRoleByIdController,
);

// Update role permissions
router.put(
  "/:id/permissions",
  authenticate,
  requirePermission("role.manage"),
  updateRolePermissionsController,
);

export default router;
