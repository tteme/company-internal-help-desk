import express from "express";
import {
  createUserController,
  getUsersController,
  getUserByIdController,
  updateUserController,
  activateUserController,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import {
  createUserValidator,
  updateUserValidator,
  activateUserValidator,
} from "../validators/user.validator.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  requirePermission("user.create"),
  createUserValidator,
  validate,
  createUserController,
);
router.get(
  "/",
  authenticate,
  requirePermission("user.view"),
  getUsersController,
);

router.get(
  "/:id",
  authenticate,
  requirePermission("user.view"),
  getUserByIdController,
);

router.patch(
  "/:id",
  authenticate,
  requirePermission("user.update"),
  updateUserValidator,
  validate,
  updateUserController,
);
router.post(
  "/activate",
  activateUserValidator,
  validate,
  activateUserController,
);

export default router;
