import { body, param } from "express-validator";

export const createUserValidator = [
  body("employeeId")
    .trim()
    .notEmpty()
    .withMessage("Employee ID is required.")
    .isLength({ max: 50 })
    .withMessage("Employee ID must not exceed 50 characters."),

  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required.")
    .isLength({ max: 100 })
    .withMessage("First name must not exceed 100 characters."),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required.")
    .isLength({ max: 100 })
    .withMessage("Last name must not exceed 100 characters."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("phone")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 13 })
    .withMessage("Phone number must not exceed 13 characters."),

  body("role")
    .notEmpty()
    .withMessage("Role is required.")
    .isIn([
      "EMPLOYEE",
      "DEPARTMENT_OFFICER",
      "DEPARTMENT_HEAD",
      "ADMIN",
      "SYSTEM_ADMINISTRATOR",
    ])
    .withMessage("Invalid user role."),

  body("branchId")
    .optional({ values: "falsy" })
    .isUUID()
    .withMessage("Branch ID must be a valid UUID."),

  body("departmentId")
    .optional({ values: "falsy" })
    .isUUID()
    .withMessage("Department ID must be a valid UUID."),
];

export const updateUserValidator = [
  body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("First name cannot be empty.")
    .isLength({ max: 100 })
    .withMessage("First name must not exceed 100 characters."),

  body("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Last name cannot be empty.")
    .isLength({ max: 100 })
    .withMessage("Last name must not exceed 100 characters."),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("phone")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 30 })
    .withMessage("Phone number must not exceed 30 characters."),

  body("role")
    .optional()
    .isIn([
      "EMPLOYEE",
      "DEPARTMENT_OFFICER",
      "DEPARTMENT_HEAD",
      "ADMIN",
      "SYSTEM_ADMINISTRATOR",
    ])
    .withMessage("Invalid user role."),

  body("branchId")
    .optional({ values: "falsy" })
    .isUUID()
    .withMessage("Branch ID must be a valid UUID."),

  body("departmentId")
    .optional({ values: "falsy" })
    .isUUID()
    .withMessage("Department ID must be a valid UUID."),
];
export const activateUserValidator = [
  body("token").trim().notEmpty().withMessage("Activation token is required."),

  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8, max: 100 })
    .withMessage("Password must be between 8 and 100 characters."),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Password confirmation is required.")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }

      return true;
    }),
];
export const userIdValidator = [
  param("id").isUUID().withMessage("User ID must be a valid UUID."),
];