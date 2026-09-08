import express from "express";
import { loginUser } from "../controllers/auth.controller.js";
import { loginValidator } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.post("/login", loginValidator, validate, loginUser);

export default router;
