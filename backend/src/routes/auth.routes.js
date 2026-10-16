import express from "express";

import {
  loginUser,
  getCurrentUser,
  logoutUser,
  forgotPassword,
  resetPasswordController,
} from "../controllers/auth.controller.js";

import {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../validators/auth.validator.js";

import { validate } from "../middlewares/validation.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

import {
  loginLimiter,
  passwordResetLimiter,
} from "../middlewares/rate-limit.middleware.js";

const router = express.Router();

router.post("/login", loginLimiter, loginValidator, validate, loginUser);

router.post(
  "/forgot-password",
  passwordResetLimiter,
  forgotPasswordValidator,
  validate,
  forgotPassword,
);

router.post(
  "/reset-password",
  passwordResetLimiter,
  resetPasswordValidator,
  validate,
  resetPasswordController,
);

router.get("/me", authenticate, getCurrentUser);
router.post("/logout", logoutUser);

export default router;
