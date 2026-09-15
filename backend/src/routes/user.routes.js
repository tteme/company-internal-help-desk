import express from "express";
import {
  createUserController,
  getUsersController,
  getUserByIdController,
  updateUserController,
  activateUserController,
  generateDevelopmentActivationTokenController,
  deactivateUserController,
  reactivateUserController,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import {
  createUserValidator,
  updateUserValidator,
  activateUserValidator,
  userIdValidator,
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

router.post(
  "/activate",
  activateUserValidator,
  validate,
  activateUserController,
);
router.get(
  "/",
  authenticate,
  requirePermission("user.view"),
  getUsersController,
);
// for local testing TO ACTIVE THE USER
router.post(
  "/:id/dev-activation",
  authenticate,
  requirePermission("user.update"),
  userIdValidator,
  validate,
  generateDevelopmentActivationTokenController,
);
// DEACTIVATE USER ACCOUNTS
router.patch(
  "/:id/deactivate",
  authenticate,
  requirePermission("user.update"),
  userIdValidator,
  validate,
  deactivateUserController,
);
//REACTIVATE USER ACCOUNTS
router.patch(
  "/:id/reactivate",
  authenticate,
  requirePermission("user.update"),
  userIdValidator,
  validate,
  reactivateUserController,
);
router.get(
  "/:id",
  authenticate,
  requirePermission("user.view"),
  userIdValidator,
  getUserByIdController,
);
router.patch(
  "/:id",
  authenticate,
  requirePermission("user.update"),
  userIdValidator,
  updateUserValidator,
  validate,
  updateUserController,
);

export default router;
