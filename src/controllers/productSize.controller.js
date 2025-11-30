import { ProductSize } from "../models/productSize.model.js";
import { Product } from "../models/product.model.js";
import { autoExport } from "./export.controller.js";
import { sequelize } from "../config/db.js";

// Get all unique sizes in the system
export const getUniqueSizes = async (req, res) => {
  try {
    const sizes = await ProductSize.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('size')), 'size'],
      ],
      order: [['size', 'ASC']],
      raw: true,
    });

    res.json(sizes.map(s => s.size));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create product size
export const createProductSize = async (req, res) => {
  try {
    const { productId, size, price, image } = req.body;

    // Validate productId
    if (!productId) return res.status(400).json({ error: "productId is required" });

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Validate size
    if (!size || String(size).trim().length === 0)
      return res.status(400).json({ error: "size is required" });

    // Validate price
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || !isFinite(priceNum) || priceNum < 0)
      return res.status(400).json({ error: "price must be a non-negative number" });

    const productSize = await ProductSize.create({
      productId: Number(productId),
      size: String(size).trim(),
      price: priceNum,
      image: image || null,
    });

    await autoExport();
    res.status(201).json(productSize);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get product sizes
export const getProductSizes = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const sizes = await ProductSize.findAll({
      where: { productId: Number(productId) },
      order: [["createdAt", "ASC"]],
    });

    res.json(sizes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single product size
export const getProductSize = async (req, res) => {
  try {
    const { id } = req.params;

    const size = await ProductSize.findByPk(id);
    if (!size) return res.status(404).json({ error: "Product size not found" });

    res.json(size);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update product size
export const updateProductSize = async (req, res) => {
  try {
    const { id } = req.params;
    const { size, price, image } = req.body;

    const productSize = await ProductSize.findByPk(id);
    if (!productSize) return res.status(404).json({ error: "Product size not found" });

    if (size !== undefined) {
      if (!String(size).trim()) return res.status(400).json({ error: "size cannot be empty" });
      productSize.size = String(size).trim();
    }

    if (price !== undefined) {
      const priceNum = Number(price);
      if (Number.isNaN(priceNum) || !isFinite(priceNum) || priceNum < 0)
        return res.status(400).json({ error: "price must be a non-negative number" });
      productSize.price = priceNum;
    }

    if (image !== undefined) productSize.image = image;

    await productSize.save();

    await autoExport();
    res.json(productSize);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete product size
export const deleteProductSize = async (req, res) => {
  try {
    const { id } = req.params;

    const productSize = await ProductSize.findByPk(id);
    if (!productSize) return res.status(404).json({ error: "Product size not found" });

    await productSize.destroy();

    await autoExport();
    res.json({ message: "Product size deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
