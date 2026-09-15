import { body, param } from "express-validator";

// ============================================================
// CREATE KEYWORD
// POST /api/categories/:categoryId/keywords
// ============================================================

export const createKeywordValidator = [
  param("categoryId")
    .trim()
    .notEmpty()
    .withMessage("Category ID is required.")
    .bail()
    .isUUID()
    .withMessage("Category ID must be a valid UUID."),

  body("keyword")
    .trim()
    .notEmpty()
    .withMessage("Keyword is required.")
    .bail()
    .isLength({ max: 100 })
    .withMessage("Keyword must not exceed 100 characters."),

  body("weight")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Keyword weight must be an integer between 1 and 10.")
    .toInt(),
];

// ============================================================
// GET KEYWORDS BY CATEGORY
// GET /api/categories/:categoryId/keywords
// ============================================================

export const keywordCategoryIdValidator = [
  param("categoryId")
    .trim()
    .notEmpty()
    .withMessage("Category ID is required.")
    .bail()
    .isUUID()
    .withMessage("Category ID must be a valid UUID."),
];

// ============================================================
// GET / UPDATE / DELETE KEYWORD BY ID
// ============================================================

export const keywordIdValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Keyword ID is required.")
    .bail()
    .isUUID()
    .withMessage("Keyword ID must be a valid UUID."),
];

// ============================================================
// UPDATE KEYWORD
// PATCH /api/category-keywords/:id
// ============================================================

export const updateKeywordValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Keyword ID is required.")
    .bail()
    .isUUID()
    .withMessage("Keyword ID must be a valid UUID."),

  body().custom((_, { req }) => {
    const allowedFields = ["keyword", "weight", "isActive"];

    const hasUpdate = allowedFields.some(
      (field) => req.body[field] !== undefined,
    );

    if (!hasUpdate) {
      throw new Error(
        "At least one field must be provided to update the keyword.",
      );
    }

    return true;
  }),

  body("keyword")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Keyword cannot be empty.")
    .bail()
    .isLength({ max: 100 })
    .withMessage("Keyword must not exceed 100 characters."),

  body("weight")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Keyword weight must be an integer between 1 and 10.")
    .toInt(),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value.")
    .toBoolean(),
];
