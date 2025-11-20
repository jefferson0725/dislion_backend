import express from "express";
import { getSetting, getAllSettings, updateSetting } from "../controllers/settings.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// Public route - get all settings
router.get("/", getAllSettings);

// Public route - get specific setting
router.get("/:key", getSetting);

// Protected route - update setting (admin only)
router.put("/:key", auth(), updateSetting);

export default router;
