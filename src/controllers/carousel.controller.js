import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get the correct carousel directory
const getCarouselDir = () => {
  if (process.env.UPLOADS_PATH) {
    // En producción: /var/www/dislion/uploads/carousel
    return path.join(path.dirname(process.env.UPLOADS_PATH), "carousel");
  }
  // En desarrollo: frontend/public/images/carousel
  return path.join(
    __dirname,
    "../../..",
    "frontend",
    "public",
    "images",
    "carousel",
  );
};

// Helper to get data.json path
const getDataFilePath = () => {
  // En producción, data.json está en /var/www/dislion/frontend/dist
  // En desarrollo, está en frontend/public
  if (process.env.NODE_ENV === "production" || process.env.UPLOADS_PATH) {
    return "/var/www/dislion/frontend/dist/data.json";
  }
  return path.join(__dirname, "../../..", "frontend", "public", "data.json");
};

// Ensure carousel directory exists
async function ensureCarouselDir() {
  try {
    const carouselDir = getCarouselDir();
    await fs.mkdir(carouselDir, { recursive: true });
  } catch (err) {
    console.error("Error creating carousel directory:", err);
  }
}

// Get all carousel images
export const getCarouselImages = async (req, res) => {
  try {
    await ensureCarouselDir();

    const carouselDir = getCarouselDir();
    const files = await fs.readdir(carouselDir);
    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map((file) => ({
        filename: file,
        url: `/images/carousel/${file}`,
      }));

    res.json({ images });
  } catch (err) {
    console.error("Error reading carousel images:", err);
    res.status(500).json({ error: "Error al obtener imágenes del carrusel" });
  }
};

// Upload carousel image
export const uploadCarouselImage = async (req, res) => {
  try {
    await ensureCarouselDir();

    if (!req.file) {
      return res
        .status(400)
        .json({ error: "No se proporcionó ninguna imagen" });
    }
    sourcePath = req.file.path;
    const carouselDir = getCarouselDir();

    // Generate unique filename with .webp extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const webpFilename = `carousel-${uniqueSuffix}.webp`;
    const destPath = path.join(carouselDir, webpFilename);

    // Convert image to WebP format
    await sharp(sourcePath)
      .webp({ quality: 85 }) // 85% quality for good balance between size and quality
      .toFile(destPath);

    // Delete original uploaded file
    await fs.unlink(sourcePath);

    res.json({
      success: true,
      filename: webpFilename,
      url: `/images/carousel/${webpFilename}`,
    });
  } catch (err) {
    console.error("Error uploading carousel image:", err);

    // Try to cleanup uploaded file on error
    try {
      if (req.file?.path) {
        await fs.unlink(req.file.path);
      }
    } catch (cleanupErr) {
      console.error("Error cleaning up file:", cleanupErr);
    }

    console.error("Error uploading carousel image:", err);
    res.status(500).json({ error: "Error al subir la imagen" });
  }
};

// Delete carousel image
export const deleteCarouselImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const carouselDir = getCarouselDir();
    const filePath = path.join(carouselDir, filename);

    await fs.unlink(filePath);

    res.json({ success: true, message: "Imagen eliminada correctamente" });
  } catch (err) {
    console.error("Error deleting carousel image:", err);
    res.status(500).json({ error: "Error al eliminar la imagen" });
  }
};

// Update carousel settings (show/hide)
export const updateCarouselSettings = async (req, res) => {
  try {
    const { show_carousel } = req.body;

    // Read current data
    const dataFile = getDataFilePath();

    // Ensure directory exists
    const dataDir = path.dirname(dataFile);
    await fs.mkdir(dataDir, { recursive: true });

    let jsonData = {};

    // Try to read existing data
    try {
      const data = await fs.readFile(dataFile, "utf-8");
      jsonData = JSON.parse(data);
    } catch (err) {
      // File doesn't exist, start with empty object
      console.log("[Carousel] Creating new data.json file");
    }

    // Update settings
    if (!jsonData.settings) {
      jsonData.settings = {};
    }
    // Store as string for consistency with other settings
    jsonData.settings.show_carousel = show_carousel ? "true" : "false";

    // Update version and timestamp
    jsonData.version = Date.now();
    jsonData.lastUpdated = new Date().toISOString();

    // Write back
    await fs.writeFile(dataFile, JSON.stringify(jsonData, null, 2));

    res.json({ success: true, show_carousel: jsonData.settings.show_carousel });
  } catch (err) {
    console.error("Error updating carousel settings:", err);
    res.status(500).json({ error: "Error al actualizar configuración" });
  }
};
