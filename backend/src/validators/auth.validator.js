import { body } from "express-validator";

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Please provide a valid email address."),

  body("password").notEmpty().withMessage("Password is required."),
];


export const forgotPasswordValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Please provide a valid email address."),
];

export const resetPasswordValidator = [
  body("token")
    .trim()
    .notEmpty()
    .withMessage("Password reset token is required."),

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
