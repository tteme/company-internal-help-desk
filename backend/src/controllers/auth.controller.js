import { login } from "../services/auth.service.js";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await login(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};
