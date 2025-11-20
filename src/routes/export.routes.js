import { Router } from "express";
import { exportDataToFrontend } from "../controllers/export.controller.js";
import auth from "../middlewares/auth.js";

const router = Router();

// Export data to frontend JSON (admin only)
router.post("/export", auth(), exportDataToFrontend);

export default router;
