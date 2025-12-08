import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
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

// Configure multer to save to a temp location first
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const frontImagesDir = getImagesDir();
    // Create directory if it doesn't exist
    fs.mkdirSync(frontImagesDir, { recursive: true });
    cb(null, frontImagesDir);
  },
  filename: (req, file, cb) => {
    // Generate a temporary unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `temp-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, gif, webp)"));
  },
});

// POST /api/uploads/frontend - Save image directly to frontend
router.post("/", auth(), upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se proporcionó ningún archivo" });
    }
    
    const frontImagesDir = getImagesDir();
    const tempPath = path.join(frontImagesDir, req.file.filename);
    
    // Get the desired filename from request body
    const desiredFilename = req.body.filename;
    
    console.log("Upload request - temp file:", req.file.filename, "desired:", desiredFilename);
    
    if (desiredFilename) {
      // Rename the file to the desired name
      const newPath = path.join(frontImagesDir, desiredFilename);
      
      // Delete the file if it already exists
      if (fs.existsSync(newPath)) {
        fs.unlinkSync(newPath);
      }
      
      // Rename the uploaded file
      fs.renameSync(tempPath, newPath);
      
      console.log("File renamed to:", desiredFilename);
      
      // Return the desired filename
      return res.json({ 
        filename: desiredFilename,
        message: "Imagen guardada en el frontend exitosamente" 
      });
    }
    
    // If no desired filename, keep the temp name
    console.log("No desired filename, keeping:", req.file.filename);
    res.json({ 
      filename: req.file.filename,
      message: "Imagen guardada en el frontend exitosamente" 
    });
  } catch (err) {
    console.error("Error uploading to frontend:", err);
    res.status(500).json({ error: err.message || "Error al guardar la imagen" });
  }
});

export default router;
