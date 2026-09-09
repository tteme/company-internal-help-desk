import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deactivateDepartment,
} from "../services/department.service.js";

// ============================================================
// CREATE DEPARTMENT
// ============================================================

export const createDepartmentController = async (req, res) => {
  try {
    // 1. Get department data from the request
    const { name, code, description } = req.body;

    // 2. Create the department
    const department = await createDepartment(name, code, description);

    // 3. Return the created department
    return res.status(201).json({
      success: true,
      message: "Department created successfully.",
      data: department,
    });
  } catch (error) {
    console.error("Create department error:", error);

    // 4. Handle known business errors
    if (
      error.message === "A department with this name already exists." ||
      error.message === "A department with this code already exists."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // 5. Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "Failed to create department.",
    });
  }
};

// ============================================================
// GET ALL DEPARTMENTS
// ============================================================

export const getDepartmentsController = async (req, res) => {
  try {
    // 1. Get all departments
    const departments = await getDepartments();

    // 2. Return departments
    return res.status(200).json({
      success: true,
      message: "Departments retrieved successfully.",
      data: departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve departments.",
    });
  }
};

// ============================================================
// GET DEPARTMENT BY ID
// ============================================================

export const getDepartmentByIdController = async (req, res) => {
  try {
    // 1. Get department ID
    const { id } = req.params;

    // 2. Get the department
    const department = await getDepartmentById(id);

    // 3. Return the department
    return res.status(200).json({
      success: true,
      message: "Department retrieved successfully.",
      data: department,
    });
  } catch (error) {
    console.error("Get department error:", error);

    // 4. Handle department not found
    if (error.message === "Department not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // 5. Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve department.",
    });
  }
};

// ============================================================
// UPDATE DEPARTMENT
// ============================================================

export const updateDepartmentController = async (req, res) => {
  try {
    // 1. Get department ID
    const { id } = req.params;

    // 2. Get update data
    const { name, code, description, isActive } = req.body;

    // 3. Update the department
    const department = await updateDepartment(
      id,
      name,
      code,
      description,
      isActive,
    );

    // 4. Return the updated department
    return res.status(200).json({
      success: true,
      message: "Department updated successfully.",
      data: department,
    });
  } catch (error) {
    console.error("Update department error:", error);

    // 5. Handle known business errors
    if (
      error.message === "Department not found." ||
      error.message === "A department with this name already exists." ||
      error.message === "A department with this code already exists."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // 6. Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "Failed to update department.",
    });
  }
};

// ============================================================
// DEACTIVATE DEPARTMENT
// ============================================================

export const deactivateDepartmentController = async (req, res) => {
  try {
    // 1. Get department ID
    const { id } = req.params;

    // 2. Deactivate the department
    const department = await deactivateDepartment(id);

    // 3. Return the updated department
    return res.status(200).json({
      success: true,
      message: "Department deactivated successfully.",
      data: department,
    });
  } catch (error) {
    console.error("Deactivate department error:", error);

    // 4. Handle known business errors
    if (
      error.message === "Department not found." ||
      error.message === "Department is already inactive."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // 5. Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "Failed to deactivate department.",
    });
  }
};
