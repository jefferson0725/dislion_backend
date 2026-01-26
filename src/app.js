import express from "express";
import cors from "cors";
import { sequelize } from "./models/index.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import productSizeRoutes from "./routes/productSize.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import frontendUploadRoutes from "./routes/frontend-upload.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import exportRoutes from "./routes/export.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import carouselRoutes from "./routes/carousel.routes.js";
import auth from "./middlewares/auth.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origen (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "https://dislion.com",
      "https://www.dislion.com",
    ];

    // En desarrollo, agregar múltiples localhost
    if (process.env.NODE_ENV !== "production") {
      allowedOrigins.push(
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
      );
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Public routes
app.use("/api/uploads", uploadRoutes);
app.use("/api/uploads/frontend", frontendUploadRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product-sizes", productSizeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/carousel", carouselRoutes);
app.use("/api", exportRoutes);

// Admin routes (protected, requires role 'admin')
app.use("/api/admin", auth(), adminRoutes);

// Database sync - Solo en desarrollo
// En producción, usa migraciones: npm run migrate
if (process.env.NODE_ENV !== "production") {
  sequelize.sync({ alter: true });
}

export default app;
