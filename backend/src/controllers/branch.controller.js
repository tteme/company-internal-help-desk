import {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deactivateBranch,
} from "../services/branch.service.js";

// ============================================================
// CREATE BRANCH
// ============================================================

export const createBranchController = async (req, res) => {
  try {
    // 1. Get branch data from the request
    const { name, code, address, phone, email } = req.body;

    // 2. Create the branch
    const branch = await createBranch(name, code, address, phone, email);

    // 3. Return the created branch
    return res.status(201).json({
      success: true,
      message: "Branch created successfully.",
      data: branch,
    });
  } catch (error) {
    console.error("Create branch error:", error);

    // 4. Handle known business errors
    if (
      error.message === "A branch with this name already exists." ||
      error.message === "A branch with this code already exists."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // 5. Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "Failed to create branch.",
    });
  }
};

// ============================================================
// GET ALL BRANCHES
// ============================================================

export const getBranchesController = async (req, res) => {
  try {
    // 1. Get all branches
    const branches = await getBranches();

    // 2. Return branches
    return res.status(200).json({
      success: true,
      message: "Branches retrieved successfully.",
      data: branches,
    });
  } catch (error) {
    console.error("Get branches error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve branches.",
    });
  }
};

// ============================================================
// GET BRANCH BY ID
// ============================================================

export const getBranchByIdController = async (req, res) => {
  try {
    // 1. Get branch ID
    const { id } = req.params;

    // 2. Get the branch
    const branch = await getBranchById(id);

    // 3. Return the branch
    return res.status(200).json({
      success: true,
      message: "Branch retrieved successfully.",
      data: branch,
    });
  } catch (error) {
    console.error("Get branch error:", error);

    // 4. Handle branch not found
    if (error.message === "Branch not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // 5. Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve branch.",
    });
  }
};

// ============================================================
// UPDATE BRANCH
// ============================================================

export const updateBranchController = async (req, res) => {
  try {
    // 1. Get branch ID
    const { id } = req.params;

    // 2. Get update data
    const { name, code, address, phone, email, isActive } = req.body;

    // 3. Update the branch
    const branch = await updateBranch(
      id,
      name,
      code,
      address,
      phone,
      email,
      isActive,
    );

    // 4. Return the updated branch
    return res.status(200).json({
      success: true,
      message: "Branch updated successfully.",
      data: branch,
    });
  } catch (error) {
    console.error("Update branch error:", error);

    // 5. Handle known business errors
    if (
      error.message === "Branch not found." ||
      error.message === "A branch with this name already exists." ||
      error.message === "A branch with this code already exists."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // 6. Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "Failed to update branch.",
    });
  }
};

// ============================================================
// DEACTIVATE BRANCH
// ============================================================

export const deactivateBranchController = async (req, res) => {
  try {
    // 1. Get branch ID
    const { id } = req.params;

    // 2. Deactivate the branch
    const branch = await deactivateBranch(id);

    // 3. Return the updated branch
    return res.status(200).json({
      success: true,
      message: "Branch deactivated successfully.",
      data: branch,
    });
  } catch (error) {
    console.error("Deactivate branch error:", error);

    // 4. Handle known business errors
    if (
      error.message === "Branch not found." ||
      error.message === "Branch is already inactive."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // 5. Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "Failed to deactivate branch.",
    });
  }
};
