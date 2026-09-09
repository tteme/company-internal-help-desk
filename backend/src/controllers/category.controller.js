import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deactivateCategory,
} from "../services/category.service.js";

// ============================================================
// CREATE CATEGORY
// ============================================================

export const createCategoryController = async (req, res) => {
  try {
    const { name, code, description, departmentId } = req.body;

    const category = await createCategory(
      name,
      code,
      description,
      departmentId,
    );

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    if (
      error.message === "Department not found." ||
      error.message ===
        "Cannot create a category under an inactive department." ||
      error.message ===
        "A category with this name already exists in this department." ||
      error.message === "A category with this code already exists."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create category.",
    });
  }
};

// ============================================================
// GET ALL CATEGORIES
// ============================================================

export const getCategoriesController = async (req, res) => {
  try {
    const categories = await getCategories();

    return res.status(200).json({
      success: true,
      message: "Categories retrieved successfully.",
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve categories.",
    });
  }
};

// ============================================================
// GET CATEGORY BY ID
// ============================================================

export const getCategoryByIdController = async (req, res) => {
  try {
    const { id: categoryId } = req.params;

    const category = await getCategoryById(categoryId);

    return res.status(200).json({
      success: true,
      message: "Category retrieved successfully.",
      data: category,
    });
  } catch (error) {
    console.error("Get category by ID error:", error);

    if (error.message === "Category not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve category.",
    });
  }
};

// ============================================================
// UPDATE CATEGORY
// ============================================================

export const updateCategoryController = async (req, res) => {
  try {
    const { id: categoryId } = req.params;

    const { name, code, description, departmentId, isActive } = req.body;

    const category = await updateCategory(
      categoryId,
      name,
      code,
      description,
      departmentId,
      isActive,
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    // Category does not exist
    if (error.message === "Category not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // Known business validation errors
    if (
      error.message === "Department not found." ||
      error.message ===
        "Cannot assign a category to an inactive department." ||
      error.message ===
        "Cannot activate a category under an inactive department." ||
      error.message ===
        "A category with this name already exists in this department." ||
      error.message === "A category with this code already exists."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update category.",
    });
  }
};

// ============================================================
// DEACTIVATE CATEGORY
// ============================================================

export const deactivateCategoryController = async (req, res) => {
  try {
    const { id: categoryId } = req.params;

    const category = await deactivateCategory(categoryId);

    return res.status(200).json({
      success: true,
      message: "Category deactivated successfully.",
      data: category,
    });
  } catch (error) {
    console.error("Deactivate category error:", error);

    if (error.message === "Category not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate category.",
    });
  }
};
