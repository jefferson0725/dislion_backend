import { Router } from "express";
import {
  createProductSize,
  getProductSizes,
  getProductSize,
  updateProductSize,
  deleteProductSize,
  getUniqueSizes,
} from "../controllers/productSize.controller.js";
import auth from "../middlewares/auth.js";

const router = Router();

// Public - get unique sizes in the system
router.get("/unique/list", getUniqueSizes);

// Public - get sizes for a product
router.get("/product/:productId", getProductSizes);
router.get("/:id", getProductSize);

// Mutating (admin only)
router.post("/", auth(), createProductSize);
router.put("/:id", auth(), updateProductSize);
router.delete("/:id", auth(), deleteProductSize);

export default router;
