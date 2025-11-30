import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { autoExport } from "./export.controller.js";

// Create product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, categoryId } = req.body;

    // Validate name
    if (!name || String(name).trim().length === 0)
      return res.status(400).json({ error: "name is required" });

    // Validate price (must be numeric and >= 0)
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || !isFinite(priceNum) || priceNum < 0)
      return res.status(400).json({ error: "price must be a non-negative number" });

    // Optionally check category exists (if provided and not empty)
    if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
      const parsedCatId = Number(categoryId);
      if (Number.isNaN(parsedCatId) || !Number.isInteger(parsedCatId))
        return res.status(400).json({ error: "categoryId must be an integer" });

      const cat = await Category.findByPk(parsedCatId);
      if (!cat) return res.status(400).json({ error: "Invalid categoryId" });
    }

    const product = await Product.create({ name: String(name).trim(), description, price: priceNum, image, categoryId: categoryId || null });

    // Image is already saved in frontend, just store the filename in DB
    // No need to copy files anymore since upload goes directly to frontend

    await autoExport();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, categoryId, displayOrder } = req.body;

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
      const parsedCatId = Number(categoryId);
      if (Number.isNaN(parsedCatId) || !Number.isInteger(parsedCatId))
        return res.status(400).json({ error: "categoryId must be an integer" });

      const cat = await Category.findByPk(parsedCatId);
      if (!cat) return res.status(400).json({ error: "Invalid categoryId" });
      product.categoryId = parsedCatId;
    }

    if (name !== undefined) {
      if (!String(name).trim()) return res.status(400).json({ error: "name cannot be empty" });
      product.name = String(name).trim();
    }

    if (description !== undefined) product.description = description;

    if (price !== undefined) {
      const priceNum = Number(price);
      if (Number.isNaN(priceNum) || !isFinite(priceNum) || priceNum < 0)
        return res.status(400).json({ error: "price must be a non-negative number" });
      product.price = priceNum;
    }

    if (image !== undefined) product.image = image;
    
    if (displayOrder !== undefined) {
      const orderNum = Number(displayOrder);
      if (!Number.isNaN(orderNum) && Number.isInteger(orderNum)) {
        product.displayOrder = orderNum;
      }
    }

    await product.save();
    
    // Auto-export data to frontend after update
    await autoExport();
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Soft delete product
export const softDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.destroy();
    
    // Auto-export data to frontend after delete
    await autoExport();
    
    res.json({ message: "Product soft-deleted", id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ 
      include: ["category", "sizes"],
      order: [["displayOrder", "ASC"], ["id", "ASC"]]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get product by id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, { include: ["category", "sizes"] });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
