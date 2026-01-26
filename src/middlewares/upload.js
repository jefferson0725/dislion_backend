import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de multer para diferentes tipos de uploads
const createStorage = (subdir) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const isDev = process.env.NODE_ENV !== "production";

      let uploadPath;
      if (isDev) {
        // En desarrollo: usar frontend/public/images/
        uploadPath = path.join(
          __dirname,
          "../../../frontend/public/images",
          subdir,
        );
      } else {
        // En producción: usar UPLOADS_PATH o default
        const baseUploadPath =
          process.env.UPLOADS_PATH || "/var/www/dislion/uploads";
        uploadPath = path.join(baseUploadPath, subdir);
      }

      // Crear directorio si no existe
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    },
  });
};

// Filtro para solo aceptar imágenes
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Solo se permiten archivos de imagen (JPEG, PNG, GIF, WEBP)"),
      false,
    );
  }
};

// Upload para productos
export const productUpload = multer({
  storage: createStorage("products"),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// Upload para carrusel
export const carouselUpload = multer({
  storage: createStorage("carousel"),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// Export default para compatibilidad
export const upload = carouselUpload;

export default productUpload;
