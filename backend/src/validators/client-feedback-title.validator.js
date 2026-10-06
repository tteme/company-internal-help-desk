import { body, param } from "express-validator";

export const createClientFeedbackTitleValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Feedback title name is required.")
    .bail()
    .isLength({ max: 100 })
    .withMessage("Feedback title name must not exceed 100 characters."),
];

export const updateClientFeedbackTitleValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Feedback title name cannot be empty.")
    .bail()
    .isLength({ max: 100 })
    .withMessage("Feedback title name must not exceed 100 characters."),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value."),
];

export const clientFeedbackTitleIdValidator = [
  param("id").isUUID().withMessage("Feedback title ID must be a valid UUID."),
];
