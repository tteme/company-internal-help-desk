import express from "express";

import {
  getNotificationsController,
  getUnreadNotificationsController,
  getUnreadNotificationCountController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
} from "../controllers/notification.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getNotificationsController);
router.get("/unread", authenticate, getUnreadNotificationsController);
router.get("/unread/count", authenticate, getUnreadNotificationCountController);
router.patch("/read-all", authenticate, markAllNotificationsAsReadController);
router.patch("/:id/read", authenticate, markNotificationAsReadController);


export default router;
