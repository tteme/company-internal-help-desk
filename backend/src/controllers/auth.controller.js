import { login } from "../services/auth.service.js";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await login(email, password);

    res.cookie("accessToken", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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
  return res.status(200).json({
    success: true,
    message: "Current user retrieved successfully.",
    data: {
      user: req.user,
    },
  });
};

export const logoutUser = (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful.",
  });
};