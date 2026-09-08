import { body, param } from "express-validator";

export const createRequestValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Request title is required.")
    .isLength({ max: 200 })
    .withMessage("Request title must not exceed 200 characters."),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Request description is required.")
    .isLength({ max: 10000 })
    .withMessage("Request description must not exceed 10000 characters."),
];

export const updateRequestStatusValidator = [
  body("status")
    .trim()
    .notEmpty()
    .withMessage("Request status is required.")
    .isIn(["IN_PROGRESS"])
    .withMessage("Invalid status transition."),
];

export const createRequestCommentValidator = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment content is required.")
    .isLength({ max: 5000 })
    .withMessage("Comment must not exceed 5000 characters."),
];

export const resolveRequestValidator = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Resolution message is required.")
    .isLength({ max: 5000 })
    .withMessage("Resolution message must not exceed 5000 characters."),
];

export const requestConfirmationValidator = [
  body("decision")
    .trim()
    .notEmpty()
    .withMessage("Decision is required.")
    .isIn(["CONFIRM", "REJECT"])
    .withMessage("Invalid confirmation decision."),

  body("message").custom((value, { req }) => {
    if (req.body.decision === "REJECT") {
      if (!value || !value.trim()) {
        throw new Error("Rejection message is required.");
      }
    }

    if (value && value.length > 5000) {
      throw new Error("Message must not exceed 5000 characters.");
    }

    return true;
  }),
];

export const escalateRequestValidator = [
  body("reason")
    .isIn(["OFFICER_ESCALATION", "COMPLEXITY", "MANAGEMENT_REQUEST"])
    .withMessage(
      "Reason must be OFFICER_ESCALATION, COMPLEXITY, or MANAGEMENT_REQUEST.",
    ),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters."),
];

export const requestIdValidator = [
  param("id").isUUID().withMessage("Request ID must be a valid UUID."),
];