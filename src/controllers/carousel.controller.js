import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

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
  if (process.env.UPLOADS_PATH) {
    return path.join(path.dirname(process.env.UPLOADS_PATH), "data.json");
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

    const filename = req.file.filename;
    const sourcePath = req.file.path;
    const carouselDir = getCarouselDir();
    const destPath = path.join(carouselDir, filename);

    // Move file to carousel directory
    await fs.rename(sourcePath, destPath);

    res.json({
      success: true,
      filename,
      url: `/images/carousel/${filename}`,
    });
  } catch (err) {
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
    const data = await fs.readFile(dataFile, "utf-8");
    const jsonData = JSON.parse(data);

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
