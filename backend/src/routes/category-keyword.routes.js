import express from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";

import {
  createKeywordController,
  getKeywordsByCategoryController,
  getKeywordByIdController,
  updateKeywordController,
  deactivateKeywordController,
} from "../controllers/category-keyword.controller.js";

import {
  createKeywordValidator,
  keywordCategoryIdValidator,
  keywordIdValidator,
  updateKeywordValidator,
} from "../validators/category-keyword.validator.js";

const router = express.Router();

// ============================================================
// CREATE KEYWORD FOR CATEGORY
// POST /api/categories/:categoryId/keywords
// ============================================================

router.post(
  "/categories/:categoryId/keywords",
  authenticate,
  requirePermission("category.keyword.create"),
  createKeywordValidator,
  validate,
  createKeywordController,
);

// ============================================================
// GET KEYWORDS BY CATEGORY
// GET /api/categories/:categoryId/keywords
// ============================================================

router.get(
  "/categories/:categoryId/keywords",
  authenticate,
  requirePermission("category.keyword.view"),
  keywordCategoryIdValidator,
  validate,
  getKeywordsByCategoryController,
);

// ============================================================
// GET KEYWORD BY ID
// GET /api/category-keywords/:id
// ============================================================

router.get(
  "/category-keywords/:id",
  authenticate,
  requirePermission("category.keyword.view"),
  keywordIdValidator,
  validate,
  getKeywordByIdController,
);

// ============================================================
// UPDATE KEYWORD
// PATCH /api/category-keywords/:id
// ============================================================

router.patch(
  "/category-keywords/:id",
  authenticate,
  requirePermission("category.keyword.update"),
  updateKeywordValidator,
  validate,
  updateKeywordController,
);

// ============================================================
// DEACTIVATE KEYWORD
// DELETE /api/category-keywords/:id
// ============================================================

router.delete(
  "/category-keywords/:id",
  authenticate,
  requirePermission("category.keyword.delete"),
  keywordIdValidator,
  validate,
  deactivateKeywordController,
);

export default router;
