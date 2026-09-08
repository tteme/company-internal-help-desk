import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  activateUser,
} from "../services/user.service.js";

export const createUserController = async (req, res) => {
  try {
    const user = await createUser({
      ...req.body,
      createdByRole: req.user.role,
    });

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