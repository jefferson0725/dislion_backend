import { Router } from "express";
import {
	createProduct,
	updateProduct,
	softDeleteProduct,
	getProducts,
	getProductById,
} from "../controllers/product.controller.js";
import auth from "../middlewares/auth.js";

const router = Router();

// Public
router.get("/", getProducts);
router.get("/:id", getProductById);

// Mutating (admin only)
router.post("/", auth(), createProduct);
router.put("/:id", auth(), updateProduct);
router.delete("/:id", auth(), softDeleteProduct);

export default router;
