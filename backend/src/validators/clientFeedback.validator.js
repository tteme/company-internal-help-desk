import { body, param, query } from "express-validator";

export const createClientFeedbackValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required.")
    .isLength({ max: 200 })
    .withMessage("Full name must not exceed 200 characters."),

  body("titleId")
    .trim()
    .notEmpty()
    .withMessage("Feedback title is required.")
    .bail()
    .isUUID()
    .withMessage("Feedback title ID must be a valid UUID."),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required.")
    .isLength({ max: 30 })
    .withMessage("Phone number must not exceed 30 characters."),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Feedback description is required.")
    .isLength({ max: 10000 })
    .withMessage("Feedback description must not exceed 10000 characters."),
];

export const clientFeedbackIdValidator = [
  param("id").isUUID().withMessage("Feedback ID must be a valid UUID."),
];

export const assignClientFeedbackValidator = [
  param("id").isUUID().withMessage("Feedback ID must be a valid UUID."),

  body("departmentId")
    .trim()
    .notEmpty()
    .withMessage("Department ID is required.")
    .isUUID()
    .withMessage("Department ID must be a valid UUID."),

  body("assignedToId")
    .trim()
    .notEmpty()
    .withMessage("Assigned user ID is required.")
    .isUUID()
    .withMessage("Assigned user ID must be a valid UUID."),
];

export const addClientFeedbackUpdateValidator = [
  param("id").isUUID().withMessage("Feedback ID must be a valid UUID."),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("Update message is required.")
    .isLength({ max: 10000 })
    .withMessage("Update message must not exceed 10000 characters."),
];

export const updateClientFeedbackStatusValidator = [
  param("id").isUUID().withMessage("Feedback ID must be a valid UUID."),

  body("status")
    .trim()
    .notEmpty()
    .withMessage("Status is required.")
    .isIn(["IN_REVIEW", "ADDRESSED", "DISMISSED"])
    .withMessage("Invalid client feedback status."),
];