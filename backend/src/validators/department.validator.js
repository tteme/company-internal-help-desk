import { body, param } from "express-validator";

// ============================================================
// CREATE DEPARTMENT VALIDATOR
// ============================================================

export const createDepartmentValidator = [
  // 1. Validate department name
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Department name is required.")
    .bail()
    .isLength({ max: 100 })
    .withMessage("Department name must not exceed 100 characters."),

  // 2. Validate department code
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Department code is required.")
    .bail()
    .isLength({ min: 2, max: 20 })
    .withMessage("Department code must be between 2 and 20 characters.")
    .bail()
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage(
      "Department code can only contain letters, numbers, hyphens, and underscores.",
    ),

  // 3. Validate description
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Department description must not exceed 1000 characters."),
];

// ============================================================
// UPDATE DEPARTMENT VALIDATOR
// ============================================================

export const updateDepartmentValidator = [
  // 1. Validate department name
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Department name cannot be empty.")
    .bail()
    .isLength({ max: 100 })
    .withMessage("Department name must not exceed 100 characters."),

  // 2. Validate department code
  body("code")
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage("Department code must be between 2 and 20 characters.")
    .bail()
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage(
      "Department code can only contain letters, numbers, hyphens, and underscores.",
    ),

  // 3. Validate description
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Department description must not exceed 1000 characters."),

  // 4. Validate active status
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value."),
];

// ============================================================
// DEPARTMENT ID VALIDATOR
// ============================================================

export const departmentIdValidator = [
  param("id").isUUID().withMessage("Department ID must be a valid UUID."),
];
