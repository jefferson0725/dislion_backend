import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import auth from "../middlewares/auth.js";

const router = express.Router();

// Helper to get the correct images directory
const getImagesDir = () => {
  // Use environment variable if set, otherwise use defaults
  if (process.env.UPLOADS_PATH) {
    return process.env.UPLOADS_PATH;
  }
  
  // Default paths
  const devPath = path.join(process.cwd(), "..", "frontend", "public", "images");
  return devPath;
};

// Configure multer to save to memory for processing
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|heic|heif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image\/(jpeg|jpg|png|gif|webp|heic|heif)/.test(file.mimetype);
    if (mimetype || extname) {
      return cb(null, true);
    }
    cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, gif, webp, heic)"));
  },
});

// Image optimization settings
const WEBP_QUALITY = 80; // Quality 0-100 (80 is good balance)
const MAX_WIDTH = 1200;  // Max width in pixels
const MAX_HEIGHT = 1200; // Max height in pixels

// POST /api/uploads/frontend - Save image directly to frontend (optimized as WebP)
router.post("/", auth(), upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se proporcionó ningún archivo" });
    }
    
    const frontImagesDir = getImagesDir();
    
    // Create directory if it doesn't exist
    fs.mkdirSync(frontImagesDir, { recursive: true });
    
    // Get the desired filename from request body and change extension to .webp
    let desiredFilename = req.body.filename;
    
    if (desiredFilename) {
      // Replace extension with .webp
      const nameWithoutExt = desiredFilename.replace(/\.[^.]+$/, '');
      desiredFilename = `${nameWithoutExt}.webp`;
    } else {
      // Generate a unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      desiredFilename = `image-${uniqueSuffix}.webp`;
    }
    
    const outputPath = path.join(frontImagesDir, desiredFilename);
    
    console.log("Processing image:", req.file.originalname, "-> ", desiredFilename);
    
    // Get original file size
    const originalSize = req.file.buffer.length;
    
    // Process and optimize image with Sharp
    const processedImage = await sharp(req.file.buffer)
      .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',           // Maintain aspect ratio, fit within bounds
        withoutEnlargement: true // Don't upscale smaller images
      })
      .webp({ 
        quality: WEBP_QUALITY,
        effort: 4  // Compression effort 0-6 (higher = smaller file, slower)
      })
      .toBuffer();
    
    // Delete the file if it already exists
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    
    // Write the optimized image
    fs.writeFileSync(outputPath, processedImage);
    
    const newSize = processedImage.length;
    const savings = Math.round((1 - newSize / originalSize) * 100);
    
    console.log(`Image optimized: ${originalSize} bytes -> ${newSize} bytes (${savings}% smaller)`);
    
    return res.json({ 
      filename: desiredFilename,
      originalSize,
      optimizedSize: newSize,
      savings: `${savings}%`,
      message: "Imagen optimizada y guardada exitosamente" 
    });
    
  } catch (err) {
    console.error("Error processing image:", err);
    res.status(500).json({ error: err.message || "Error al procesar la imagen" });
  }
});

export default router;
