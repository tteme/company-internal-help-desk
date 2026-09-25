import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  activateUser,
  generateDevelopmentActivationToken,
  deactivateUser,
  reactivateUser,
  updateUserAvailability,
} from "../services/user.service.js";
// ============================================================
// DEVELOPMENT TESTING
// Generate activation token for local development.
// ============================================================
export const generateDevelopmentActivationTokenController = async (
  req,
  res,
) => {
  try {
    const activationData = await generateDevelopmentActivationToken(
      req.params.id,
    );

    return res.status(200).json({
      success: true,
      message: "Development activation token generated successfully.",
      data: activationData,
    });
  } catch (error) {
    console.error("Generate development activation token error:", error);

    if (
      error.message ===
        "Development activation is only available in development mode." ||
      error.message === "User not found." ||
      error.message === "Only pending user accounts can be activated."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate development activation token.",
    });
  }
};
// ============================================================
// CREATE USERS
// ============================================================
export const createUserController = async (req, res) => {
  try {
    console.log("➡️ Create user request started");
    const user = await createUser({
      ...req.body,
      createdByRole: req.user.role,
    });
    console.log("✅ createUser service completed");
    console.log("📤 Sending create user response");

    return res.status(201).json({
      success: true,
      message: "User account created successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Create user error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// ============================================================
// ACTIVATE USERS
// ============================================================
export const activateUserController = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await activateUser(token, password);

    return res.status(200).json({
      success: true,
      message: "Account activated successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Activate user error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// ============================================================
// GET ALL USERS
// ============================================================
export const getUsersController = async (req, res) => {
  try {
    const users = await getUsers();

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully.",
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users.",
    });
  }
};
// ============================================================
// GET USER BY ID
// ============================================================

export const getUserByIdController = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);

    if (error.message === "User not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user.",
    });
  }
};
// ============================================================
// UPDATE USER
// ============================================================
export const updateUserController = async (req, res) => {
  try {
    const user = await updateUser(req.params.id, {
      ...req.body,
      updatedByRole: req.user.role,
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (error.message === "User not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// UPDATE USER AVAILABILITY
// ============================================================
export const updateUserAvailabilityController = async (req, res) => {
  try {
    const user = await updateUserAvailability(
      req.params.id,
      req.body.availability,
    );

    return res.status(200).json({
      success: true,
      message: "User availability updated successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Update user availability error:", error);

    if (error.message === "User not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message ===
        "Only department officers and department heads can have their availability changed." ||
      error.message ===
        "Only active user accounts can have their availability changed."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update user availability.",
    });
  }
};

// ============================================================
// DEACTIVATE USER ACCOUNT
// ============================================================
export const deactivateUserController = async (req, res) => {
  try {
    const user = await deactivateUser(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User account deactivated successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Deactivate user error:", error);

    if (
      error.message === "User not found." ||
      error.message === "User account is already inactive."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate user account.",
    });
  }
};
// ============================================================
// REACTIVATE USER ACCOUNTs
// ============================================================
export const reactivateUserController = async (req, res) => {
  try {
    const user = await reactivateUser(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User account reactivated successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Reactivate user error:", error);

    if (
      error.message === "User not found." ||
      error.message === "User account is already active."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to reactivate user account.",
    });
  }
};