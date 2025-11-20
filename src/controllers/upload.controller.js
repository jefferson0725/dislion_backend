import path from "path";
import fs from "fs";

export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Path where multer saved the file (backend/uploads/products)
    const savedPath = path.join(process.cwd(), "uploads", "products", req.file.filename);

    // Also copy the file into the frontend assets folder so it's included in the client
    // frontend path: ../front/src/assets/products relative to backend project folder
    try {
      const frontAssetsDir = path.join(process.cwd(), "..", "front", "src", "assets", "products");
      fs.mkdirSync(frontAssetsDir, { recursive: true });
      const destPath = path.join(frontAssetsDir, req.file.filename);
      // copy the file (overwrite if exists)
      fs.copyFileSync(savedPath, destPath);
    } catch (copyErr) {
      // Log the error but don't fail the whole request — still return the web path.
      console.error("Failed to copy uploaded file to front assets:", copyErr);
    }

    // Ensure we return a web-accessible path for the backend static server
    const filePath = path.join("/uploads", "products", req.file.filename);
    res.status(201).json({ image: filePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { uploadProductImage };
