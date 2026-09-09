import { body, param } from "express-validator";

// ============================================================
// CREATE CATEGORY VALIDATOR
// ============================================================

export const createCategoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required.")
    .bail()
    .isLength({ max: 100 })
    .withMessage("Category name must not exceed 100 characters."),

  body("code")
    .trim()
    .notEmpty()
    .withMessage("Category code is required.")
    .bail()
    .isLength({ min: 2, max: 20 })
    .withMessage("Category code must be between 2 and 20 characters.")
    .bail()
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage(
      "Category code can only contain letters, numbers, hyphens, and underscores.",
    ),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Category description must not exceed 1000 characters."),

  body("departmentId")
    .trim()
    .notEmpty()
    .withMessage("Department ID is required.")
    .bail()
    .isUUID()
    .withMessage("Department ID must be a valid UUID."),
];

// ============================================================
// UPDATE CATEGORY VALIDATOR
// ============================================================

export const updateCategoryValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category name cannot be empty.")
    .bail()
    .isLength({ max: 100 })
    .withMessage("Category name must not exceed 100 characters."),

  body("code")
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage("Category code must be between 2 and 20 characters.")
    .bail()
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage(
      "Category code can only contain letters, numbers, hyphens, and underscores.",
    ),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Category description must not exceed 1000 characters."),

  body("departmentId")
    .optional()
    .trim()
    .isUUID()
    .withMessage("Department ID must be a valid UUID."),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value."),
];

// ============================================================
// CATEGORY ID VALIDATOR
// ============================================================

export const categoryIdValidator = [
  param("id").isUUID().withMessage("Category ID must be a valid UUID."),
];
