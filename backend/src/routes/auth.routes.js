import express from "express";
import { loginUser } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

const router = express.Router();

router.post("/login", loginUser);


export default router;
