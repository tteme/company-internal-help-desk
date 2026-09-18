import express from "express";

import {
  loginUser,
  getCurrentUser,
  logoutUser,
} from "../controllers/auth.controller.js";
import { loginValidator } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validation.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", loginValidator, validate, loginUser);

router.get("/me", authenticate, getCurrentUser);
router.post("/logout", logoutUser);

export default router;
