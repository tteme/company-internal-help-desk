import { param, body } from "express-validator";

export const systemSettingKeyValidator = [
  param("key").trim().notEmpty().withMessage("System setting key is required."),
];

export const updateSystemSettingValidator = [
  param("key").trim().notEmpty().withMessage("System setting key is required."),

  body("value")
    .exists()
    .withMessage("System setting value is required.")
    .custom((value) => {
      if (value === null || value === undefined) {
        throw new Error("System setting value is required.");
      }

      return true;
    }),
];
