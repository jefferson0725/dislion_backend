import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import auth from "../middlewares/auth.js";
import { uploadProductImage } from "../controllers/upload.controller.js";

const router = Router();

// Ensure uploads/products directory exists
const uploadDir = path.join(process.cwd(), "uploads", "products");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    cb(null, name);
  },
});

const upload = multer({ storage });

// POST /api/uploads/products - upload product image (admin only)
router.post("/products", auth(), upload.single("image"), uploadProductImage);

export default router;
