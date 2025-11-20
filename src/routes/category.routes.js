import { Router } from "express";
import {
	createCategory,
	updateCategory,
	softDeleteCategory,
	getCategories,
	getCategoryById,
	restoreCategory,
} from "../controllers/category.controller.js";
import auth from "../middlewares/auth.js";

const router = Router();

// Public
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Mutating (admin only)
router.post("/", auth(), createCategory);
router.put("/:id", auth(), updateCategory);
router.delete("/:id", auth(), softDeleteCategory);
router.patch("/:id/restore", auth(), restoreCategory);

export default router;

