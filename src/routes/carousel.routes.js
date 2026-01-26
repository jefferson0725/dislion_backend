import express from "express";
import auth, { isAdmin } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";
import {
  getCarouselImages,
  uploadCarouselImage,
  deleteCarouselImage,
  updateCarouselSettings,
} from "../controllers/carousel.controller.js";

const router = express.Router();

// Get all carousel images
router.get("/", getCarouselImages);

// Upload carousel image (admin only)
router.post(
  "/upload",
  auth(),
  isAdmin,
  upload.single("image"),
  uploadCarouselImage,
);

// Delete carousel image (admin only)
router.delete("/:filename", auth(), isAdmin, deleteCarouselImage);

// Update carousel settings (admin only)
router.put("/settings", auth(), isAdmin, updateCarouselSettings);

export default router;
