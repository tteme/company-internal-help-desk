import { body, param } from "express-validator";

// ============================================================
// BUSINESS HOURS DAY VALIDATOR
// ============================================================

export const businessHoursDayValidator = [
  param("day")
    .trim()
    .toUpperCase()
    .isIn([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ])
    .withMessage("Day must be a valid day of the week."),
];

// ============================================================
// UPDATE BUSINESS HOURS VALIDATOR
// ============================================================

export const updateBusinessHoursValidator = [
  body("startTime")
    .optional()
    .trim()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Start time must be in HH:MM format."),

  body("breakStartTime")
    .optional({ nullable: true })
    .trim()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Break start time must be in HH:MM format."),

  body("breakEndTime")
    .optional({ nullable: true })
    .trim()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Break end time must be in HH:MM format."),

  body("endTime")
    .optional()
    .trim()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("End time must be in HH:MM format."),

  body("isWorking")
    .optional()
    .isBoolean({ strict: true })
    .withMessage("isWorking must be a boolean value."),

  // Reuse the day validation instead of duplicating it.
  ...businessHoursDayValidator,
];
