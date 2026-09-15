import {
  createKeyword,
  getKeywordsByCategory,
  getKeywordById,
  updateKeyword,
  deactivateKeyword,
} from "../services/category-keyword.service.js";

// ============================================================
// CREATE KEYWORD
// ============================================================

export const createKeywordController = async (req, res) => {
  try {
    // 1. Get data from request
    const { categoryId } = req.params;
    const { keyword, weight } = req.body;

    // 2. Create keyword
    const createdKeyword = await createKeyword(categoryId, keyword, weight);

    // 3. Return response
    return res.status(201).json({
      success: true,
      message: "Keyword created successfully.",
      data: createdKeyword,
    });
  } catch (error) {
    console.error("Create keyword error:", error);

    // 4. Handle expected business errors
    const knownErrors = [
      "Category not found.",
      "Cannot create a keyword for an inactive category.",
      "Cannot create a keyword under a category with an inactive department.",
      "A keyword with this value already exists in this category.",
    ];

    if (knownErrors.includes(error.message)) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // 5. Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "Failed to create keyword.",
    });
  }
};

// ============================================================
// GET KEYWORDS BY CATEGORY
// ============================================================

export const getKeywordsByCategoryController = async (req, res) => {
  try {
    // 1. Get category ID
    const { categoryId } = req.params;

    // 2. Get keywords
    const keywords = await getKeywordsByCategory(categoryId);

    // 3. Return response
    return res.status(200).json({
      success: true,
      message: "Keywords retrieved successfully.",
      data: keywords,
    });
  } catch (error) {
    console.error("Get keywords by category error:", error);

    // 4. Handle category not found
    if (error.message === "Category not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // 5. Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve category keywords.",
    });
  }
};

// ============================================================
// GET KEYWORD BY ID
// ============================================================

export const getKeywordByIdController = async (req, res) => {
  try {
    // 1. Get keyword ID
    const { id } = req.params;

    // 2. Get keyword
    const keyword = await getKeywordById(id);

    // 3. Return response
    return res.status(200).json({
      success: true,
      message: "Keyword retrieved successfully.",
      data: keyword,
    });
  } catch (error) {
    console.error("Get keyword by ID error:", error);

    // 4. Handle keyword not found
    if (error.message === "Keyword not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // 5. Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve keyword.",
    });
  }
};

// ============================================================
// UPDATE KEYWORD
// ============================================================

export const updateKeywordController = async (req, res) => {
  try {
    // 1. Get data from request
    const { id } = req.params;
    const { keyword, weight, isActive } = req.body;

    // 2. Update keyword
    const updatedKeyword = await updateKeyword(id, keyword, weight, isActive);

    // 3. Return response
    return res.status(200).json({
      success: true,
      message: "Keyword updated successfully.",
      data: updatedKeyword,
    });
  } catch (error) {
    console.error("Update keyword error:", error);

    // 4. Handle expected business errors
    const knownErrors = [
      "Keyword not found.",
      "Cannot activate a keyword under an inactive category.",
      "Cannot activate a keyword under a category with an inactive department.",
      "A keyword with this value already exists in this category.",
    ];

    if (error.message === "Keyword not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (knownErrors.includes(error.message)) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // 5. Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "Failed to update keyword.",
    });
  }
};

// ============================================================
// DEACTIVATE KEYWORD
// ============================================================

export const deactivateKeywordController = async (req, res) => {
  try {
    // 1. Get keyword ID
    const { id } = req.params;

    // 2. Deactivate keyword
    const updatedKeyword = await deactivateKeyword(id);

    // 3. Return response
    return res.status(200).json({
      success: true,
      message: "Keyword deactivated successfully.",
      data: updatedKeyword,
    });
  } catch (error) {
    console.error("Deactivate keyword error:", error);

    // 4. Handle keyword not found
    if (error.message === "Keyword not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // 5. Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "Failed to deactivate keyword.",
    });
  }
};
