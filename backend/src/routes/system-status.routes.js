import express from "express";

import { getSystemStatusController } from "../controllers/system-status.controller.js";

const router = express.Router();

router.get("/", getSystemStatusController);

export default router;
