import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import auth from "../middlewares/auth.js";

const router = express.Router();

// Configure multer to save directly to frontend public/images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Try production path first, then dev path
    let frontImagesDir;
    const prodPath = "/var/www/dislion/front/public/images";
    const devPath = path.join(process.cwd(), "..", "frontend", "public", "images");
    
    if (fs.existsSync("/var/www/dislion/front")) {
      frontImagesDir = prodPath; // Production
    } else {
      frontImagesDir = devPath; // Development
    }
    
    // Create directory if it doesn't exist
    fs.mkdirSync(frontImagesDir, { recursive: true });
    cb(null, frontImagesDir);
  },
  filename: (req, file, cb) => {
    // The filename will be set from the request, handled in the route
    cb(null, file.originalname); // Temporary, will be renamed
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
    
    // Determine the correct images directory
    let frontImagesDir;
    if (fs.existsSync("/var/www/dislion/front")) {
      frontImagesDir = "/var/www/dislion/front/public/images"; // Production
    } else {
      frontImagesDir = path.join(process.cwd(), "..", "frontend", "public", "images"); // Development
    }
    
    const tempPath = path.join(frontImagesDir, req.file.filename);
    
    // Get the desired filename from request body
    const desiredFilename = req.body.filename;
    
    if (desiredFilename && desiredFilename !== req.file.filename) {
      // Rename the file to the desired name
      const newPath = path.join(frontImagesDir, desiredFilename);
      
      // Delete the file if it already exists
      if (fs.existsSync(newPath)) {
        fs.unlinkSync(newPath);
      }
      
      // Rename the uploaded file
      fs.renameSync(tempPath, newPath);
      
      // Return the desired filename
      return res.json({ 
        filename: desiredFilename,
        message: "Imagen guardada en el frontend exitosamente" 
      });
    }
    
    // Return just the filename (not the full path)
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
