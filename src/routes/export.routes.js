import { Router } from "express";
import { exportDataToFrontend, getExportedData } from "../controllers/export.controller.js";
import auth from "../middlewares/auth.js";

const router = Router();

// Get exported data (public access)
router.get("/export", getExportedData);

// Export data to frontend JSON (admin only)
router.post("/export", auth(), exportDataToFrontend);

export default router;
