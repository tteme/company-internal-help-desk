import { login } from "../services/auth.service.js";
import {
  requestPasswordReset,
  resetPassword,
} from "../services/password-reset.service.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: "lax",
  path: "/",
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await login(email, password);

    res.cookie("accessToken", result.token, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 60 * 8,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  // Never send credential or token fields to the browser.
  const { passwordHash, activationToken, activationExpires, ...safeUser } =
    req.user;

  return res.status(200).json({
    success: true,
    message: "Current user retrieved successfully.",
    data: {
      user: safeUser,
    },
  });
};

export const logoutUser = (req, res) => {
  res.clearCookie("accessToken", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logout successful.",
  });
};


export const forgotPassword = async (req, res) => {
  try {
    await requestPasswordReset(req.body.email);

    return res.status(200).json({
      success: true,
      message:
        "If an eligible account exists for that email, you will receive a password reset link.",
    });
  } catch (error) {
    console.error("Password reset request failed.");

    return res.status(500).json({
      success: false,
      message: "Unable to process your request. Please try again later.",
    });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    await resetPassword({
      token: req.body.token,
      password: req.body.password,
    });

    return res.status(200).json({
      success: true,
      message: "Your password has been reset successfully. You can now log in.",
    });
  } catch (error) {
    const invalidToken =
      error.message === "Invalid or expired password reset link.";

    if (invalidToken) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Password reset failed.");

    return res.status(500).json({
      success: false,
      message: "Unable to reset your password. Please try again later.",
    });
  }
};
