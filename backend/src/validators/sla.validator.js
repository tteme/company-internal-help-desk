import { body, param } from "express-validator";

// ============================================================
// CREATE SLA POLICY VALIDATOR
// ============================================================

export const createSlaValidator = [
  // 1. Validate SLA name
  body("name")
    .trim()
    .notEmpty()
    .withMessage("SLA policy name is required.")
    .bail()
    .isLength({ max: 100 })
    .withMessage("SLA policy name must not exceed 100 characters."),

  // 2. Validate SLA description
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("SLA policy description must not exceed 1000 characters."),

  // 3. Validate department ID
  body("departmentId")
    .trim()
    .notEmpty()
    .withMessage("Department ID is required.")
    .bail()
    .isUUID()
    .withMessage("Department ID must be a valid UUID."),

  // 4. Validate priority
  body("priority")
    .trim()
    .notEmpty()
    .withMessage("Priority is required.")
    .bail()
    .isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
    .withMessage("Priority must be LOW, MEDIUM, HIGH, or CRITICAL."),

  // 5. Validate response time
  body("responseTimeMinutes")
    .notEmpty()
    .withMessage("Response time is required.")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Response time must be a positive integer."),

  // 6. Validate resolution time
  body("resolutionTimeMinutes")
    .notEmpty()
    .withMessage("Resolution time is required.")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Resolution time must be a positive integer."),

  // 7. Validate warning percentage
  body("warningPercentage")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Warning percentage must be between 1 and 100."),

  // 8. Validate active status
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value."),
];

// ============================================================
// UPDATE SLA POLICY VALIDATOR
// ============================================================

export const updateSlaValidator = [
  // 1. Validate SLA name
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("SLA policy name cannot be empty.")
    .bail()
    .isLength({ max: 100 })
    .withMessage("SLA policy name must not exceed 100 characters."),

  // 2. Validate SLA description
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("SLA policy description must not exceed 1000 characters."),

  // 3. Validate department ID
  body("departmentId")
    .optional()
    .trim()
    .isUUID()
    .withMessage("Department ID must be a valid UUID."),

  // 4. Validate priority
  body("priority")
    .optional()
    .trim()
    .isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
    .withMessage("Priority must be LOW, MEDIUM, HIGH, or CRITICAL."),

  // 5. Validate response time
  body("responseTimeMinutes")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Response time must be a positive integer."),

  // 6. Validate resolution time
  body("resolutionTimeMinutes")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Resolution time must be a positive integer."),

  // 7. Validate warning percentage
  body("warningPercentage")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Warning percentage must be between 1 and 100."),

  // 8. Validate active status
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value."),
];

// ============================================================
// SLA POLICY ID VALIDATOR
// ============================================================

export const slaIdValidator = [
  param("id").isUUID().withMessage("SLA policy ID must be a valid UUID."),
];
