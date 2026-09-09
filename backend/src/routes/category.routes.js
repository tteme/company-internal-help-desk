import express from "express";

import {
  createCategoryController,
  getCategoriesController,
  getCategoryByIdController,
  updateCategoryController,
  deactivateCategoryController,
} from "../controllers/category.controller.js";

import {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator,
} from "../validators/category.validator.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

// ============================================================
// CATEGORY ROUTES
// ============================================================

// Create category
router.post(
  "/",
  authenticate,
  requirePermission("category.create"),
  createCategoryValidator,
  validate,
  createCategoryController,
);

// Get all categories
router.get(
  "/",
  authenticate,
  requirePermission("category.view"),
  getCategoriesController,
);

// Get category by ID
router.get(
  "/:id",
  authenticate,
  requirePermission("category.view"),
  categoryIdValidator,
  validate,
  getCategoryByIdController,
);

// Update category
router.patch(
  "/:id",
  authenticate,
  requirePermission("category.update"),
  categoryIdValidator,
  updateCategoryValidator,
  validate,
  updateCategoryController,
);

// Deactivate category
router.delete(
  "/:id",
  authenticate,
  requirePermission("category.delete"),
  categoryIdValidator,
  validate,
  deactivateCategoryController,
);

export default router;
