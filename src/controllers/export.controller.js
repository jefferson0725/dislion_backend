import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { ProductSize } from "../models/productSize.model.js";
import { Settings } from "../models/settings.model.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get the correct frontend path (works in dev and production)
function getFrontendDistPath() {
  // In production: /var/www/dislion/frontend/dist
  // In development: ../frontend/public (for Vite dev server)
  const possiblePaths = [
    "/var/www/dislion/frontend/dist", // Production
    path.join(process.cwd(), "..", "frontend", "public"), // Dev - use public for Vite
    path.join(process.cwd(), "..", "frontend", "dist"), // Dev fallback
  ];

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        console.log(`[Export] Using frontend path: ${p}`);
        return p;
      }
    } catch (e) {
      console.log(`[Export] Path check failed for ${p}:`, e.message);
    }
  }

  // Fallback to relative path
  const fallback = path.join(process.cwd(), "..", "frontend", "public");
  console.log(`[Export] Using fallback path: ${fallback}`);
  return fallback;
}

// Export all data to JSON file in frontend
export const exportDataToFrontend = async (req, res) => {
  try {
    // Get all categories and products
    const categories = await Category.findAll({
      attributes: ["id", "name", "description"],
      raw: true,
    });

    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    // Get settings
    const settings = await Settings.findAll({ raw: true });
    const settingsObj = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    // Read existing data.json to preserve carousel settings
    const frontendDistDir = getFrontendDistPath();
    const dataFilePath = path.join(frontendDistDir, "data.json");
    let existingCarouselSetting = "false";

    try {
      if (fs.existsSync(dataFilePath)) {
        const existingData = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
        if (existingData.settings?.show_carousel) {
          existingCarouselSetting = existingData.settings.show_carousel;
        }
      }
    } catch (err) {
      console.log(
        "[Export] Could not read existing carousel setting:",
        err.message,
      );
    }

    // Add carousel setting to settingsObj
    settingsObj.show_carousel = existingCarouselSetting;

    // Transform products data
    const productsData = await Promise.all(
      products.map(async (product) => {
        const productData = product.toJSON();

        // Get sizes for this product
        const sizes = await ProductSize.findAll({
          where: { productId: product.id },
          attributes: ["id", "size", "price", "image"],
          raw: true,
        });

        return {
          id: productData.id,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          image: productData.image ? path.basename(productData.image) : null,
          category: productData.category
            ? {
                id: productData.category.id,
                name: productData.category.name,
              }
            : null,
          categoryId: productData.categoryId,
          sizes: sizes.map((s) => ({
            id: s.id,
            size: s.size,
            price: s.price,
            image: s.image ? path.basename(s.image) : null,
          })),
        };
      }),
    );

    // Create data object with version timestamp
    const exportData = {
      version: new Date().getTime(), // Unix timestamp - changes every time
      lastUpdated: new Date().toISOString(),
      settings: settingsObj,
      categories,
      products: productsData,
    };

    // Ensure directory exists
    await fs.promises.mkdir(frontendDistDir, { recursive: true });

    // Write JSON file
    await fs.promises.writeFile(
      dataFilePath,
      JSON.stringify(exportData, null, 2),
      "utf8",
    );

    console.log(`Data exported to: ${dataFilePath}`);

    res.json({
      message: "Data exported successfully to frontend",
      path: dataFilePath,
      data: exportData,
      stats: {
        categories: categories.length,
        products: productsData.length,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get exported data (for frontend public access)
export const getExportedData = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ["id", "name", "description"],
      raw: true,
    });

    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    const settings = await Settings.findAll({ raw: true });
    const settingsObj = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    // Read existing data.json to get carousel setting (if endpoint is called directly)
    const frontendDistDir = getFrontendDistPath();
    const dataFilePath = path.join(frontendDistDir, "data.json");

    try {
      if (fs.existsSync(dataFilePath)) {
        const existingData = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
        if (existingData.settings?.show_carousel) {
          settingsObj.show_carousel = existingData.settings.show_carousel;
        }
      }
    } catch (err) {
      console.log(
        "[getExportedData] Could not read carousel setting:",
        err.message,
      );
    }

    const productsData = await Promise.all(
      products.map(async (product) => {
        const productData = product.toJSON();

        // Get sizes for this product
        const sizes = await ProductSize.findAll({
          where: { productId: product.id },
          attributes: ["id", "size", "price", "image"],
          raw: true,
        });

        return {
          id: productData.id,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          image: productData.image ? path.basename(productData.image) : null,
          category: productData.category
            ? {
                id: productData.category.id,
                name: productData.category.name,
              }
            : null,
          categoryId: productData.categoryId,
          sizes: sizes.map((s) => ({
            id: s.id,
            size: s.size,
            price: s.price,
            image: s.image ? path.basename(s.image) : null,
          })),
        };
      }),
    );

    const exportData = {
      version: new Date().getTime(), // Unix timestamp - changes every time
      lastUpdated: new Date().toISOString(),
      settings: settingsObj,
      categories,
      products: productsData,
    };

    res.json(exportData);
  } catch (error) {
    console.error("Get exported data error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Auto-export after product/category changes
export const autoExport = async () => {
  try {
    const categories = await Category.findAll({
      attributes: ["id", "name", "description"],
      raw: true,
    });

    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    const productsData = await Promise.all(
      products.map(async (product) => {
        const productData = product.toJSON();

        // Get sizes for this product
        const sizes = await ProductSize.findAll({
          where: { productId: product.id },
          attributes: ["id", "size", "price", "image"],
          raw: true,
        });

        return {
          id: productData.id,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          image: productData.image ? path.basename(productData.image) : null,
          category: productData.category
            ? {
                id: productData.category.id,
                name: productData.category.name,
              }
            : null,
          categoryId: productData.categoryId,
          sizes: sizes.map((s) => ({
            id: s.id,
            size: s.size,
            price: s.price,
            image: s.image ? path.basename(s.image) : null,
          })),
        };
      }),
    );

    const exportData = {
      version: new Date().getTime(), // Unix timestamp - changes every time
      lastUpdated: new Date().toISOString(),
      categories,
      products: productsData,
    };

    const frontendDistDir = getFrontendDistPath();
    const dataFilePath = path.join(frontendDistDir, "data.json");

    await fs.promises.mkdir(frontendDistDir, { recursive: true });
    await fs.promises.writeFile(
      dataFilePath,
      JSON.stringify(exportData, null, 2),
      "utf8",
    );

    console.log(`Auto-export completed: ${new Date().toISOString()}`);
  } catch (error) {
    console.error("Auto-export error:", error);
  }
};
