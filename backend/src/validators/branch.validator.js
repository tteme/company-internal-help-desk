import { body, param } from "express-validator";

// ============================================================
// CREATE BRANCH VALIDATOR
// ============================================================

export const createBranchValidator = [
  // 1. Validate branch name
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Branch name is required.")
    .bail()
    .isLength({ max: 100 })
    .withMessage("Branch name must not exceed 100 characters."),

  // 2. Validate branch code
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Branch code is required.")
    .bail()
    .isLength({ min: 2, max: 20 })
    .withMessage("Branch code must be between 2 and 20 characters.")
    .bail()
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage(
      "Branch code can only contain letters, numbers, hyphens, and underscores.",
    ),

  // 3. Validate address
  body("address")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Branch address must not exceed 255 characters."),

  // 4. Validate phone
  body("phone")
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Branch phone must not exceed 30 characters."),

  // 5. Validate email
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Branch email must be a valid email address.")
    .normalizeEmail(),
];

// ============================================================
// UPDATE BRANCH VALIDATOR
// ============================================================

export const updateBranchValidator = [
  // 1. Validate branch name
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Branch name cannot be empty.")
    .bail()
    .isLength({ max: 100 })
    .withMessage("Branch name must not exceed 100 characters."),

  // 2. Validate branch code
  body("code")
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage("Branch code must be between 2 and 20 characters.")
    .bail()
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage(
      "Branch code can only contain letters, numbers, hyphens, and underscores.",
    ),

  // 3. Validate address
  body("address")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Branch address must not exceed 255 characters."),

  // 4. Validate phone
  body("phone")
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Branch phone must not exceed 30 characters."),

  // 5. Validate email
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Branch email must be a valid email address.")
    .normalizeEmail(),

  // 6. Validate active status
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value."),
];

// ============================================================
// BRANCH ID VALIDATOR
// ============================================================

export const branchIdValidator = [
  param("id").isUUID().withMessage("Branch ID must be a valid UUID."),
];
