import express from "express";

import {
  getSystemSettingsController,
  getSystemSettingByKeyController,
  updateSystemSettingController,
} from "../controllers/system-setting.controller.js";

import {
  systemSettingKeyValidator,
  updateSystemSettingValidator,
} from "../validators/system-setting.validator.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  requirePermission("system.settings"),
  getSystemSettingsController,
);

router.get(
  "/:key",
  authenticate,
  requirePermission("system.settings"),
  systemSettingKeyValidator,
  validate,
  getSystemSettingByKeyController,
);

router.patch(
  "/:key",
  authenticate,
  requirePermission("system.settings"),
  systemSettingKeyValidator,
  updateSystemSettingValidator,
  validate,
  updateSystemSettingController,
);

export default router;
