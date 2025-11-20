import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { Settings } from "../models/settings.model.js";
import path from "path";
import fs from "fs";

// Export all data to JSON file in frontend
export const exportDataToFrontend = async (req, res) => {
  try {
    // Get all categories and products
    const categories = await Category.findAll({
      attributes: ['id', 'name', 'description'],
      raw: true
    });

    const products = await Product.findAll({
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });

    // Get settings
    const settings = await Settings.findAll({ raw: true });
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    // Transform products data
    const productsData = products.map(product => {
      const productData = product.toJSON();
      return {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image: productData.image ? path.basename(productData.image) : null,
        category: productData.category ? {
          id: productData.category.id,
          name: productData.category.name
        } : null,
        categoryId: productData.categoryId
      };
    });

    // Create data object
    const exportData = {
      lastUpdated: new Date().toISOString(),
      settings: settingsObj,
      categories,
      products: productsData
    };

    // Define path to frontend public directory
    const frontendPublicDir = path.join(process.cwd(), "..", "frontend", "public");
    const dataFilePath = path.join(frontendPublicDir, "data.json");

    // Ensure directory exists
    await fs.promises.mkdir(frontendPublicDir, { recursive: true });

    // Write JSON file
    await fs.promises.writeFile(
      dataFilePath,
      JSON.stringify(exportData, null, 2),
      'utf8'
    );

    console.log(`Data exported to: ${dataFilePath}`);
    
    res.json({
      message: "Data exported successfully to frontend",
      path: dataFilePath,
      stats: {
        categories: categories.length,
        products: productsData.length
      }
    });
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Auto-export after product/category changes
export const autoExport = async () => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name', 'description'],
      raw: true
    });

    const products = await Product.findAll({
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });

    const productsData = products.map(product => {
      const productData = product.toJSON();
      return {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image: productData.image ? path.basename(productData.image) : null,
        category: productData.category ? {
          id: productData.category.id,
          name: productData.category.name
        } : null,
        categoryId: productData.categoryId
      };
    });

    const exportData = {
      lastUpdated: new Date().toISOString(),
      categories,
      products: productsData
    };

    const frontendPublicDir = path.join(process.cwd(), "..", "frontend", "public");
    const dataFilePath = path.join(frontendPublicDir, "data.json");

    await fs.promises.mkdir(frontendPublicDir, { recursive: true });
    await fs.promises.writeFile(
      dataFilePath,
      JSON.stringify(exportData, null, 2),
      'utf8'
    );

    console.log(`Auto-export completed: ${new Date().toISOString()}`);
  } catch (error) {
    console.error("Auto-export error:", error);
  }
};
