import { Category } from "../models/category.model.js";
import { autoExport } from "./export.controller.js";

// Create a new category
export const createCategory = async (req, res) => {
	try {
		const { name, description } = req.body;

		if (!name) return res.status(400).json({ error: "El nombre es obligatorio" });

		const [category, created] = await Category.findOrCreate({
			where: { name },
			defaults: { description },
		});

		if (!created) return res.status(409).json({ error: "La categoría ya existe" });

		// Auto-export data to frontend
		await autoExport();

		res.status(201).json(category);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Update category by id
export const updateCategory = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, description } = req.body;

		const category = await Category.findByPk(id);
		if (!category) return res.status(404).json({ error: "Categoría no encontrada" });

		// If name is being changed, check for duplicates
		if (name && name !== category.name) {
			const existing = await Category.findOne({ where: { name } });
			if (existing) {
				return res.status(409).json({ error: "Ya existe una categoría con ese nombre" });
			}
			category.name = name;
		}

		if (description !== undefined) category.description = description;

		await category.save();
		
		// Auto-export data to frontend
		await autoExport();
		
		res.json(category);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Soft delete category (paranoid)
export const softDeleteCategory = async (req, res) => {
	try {
		const { id } = req.params;

		const category = await Category.findByPk(id);
		if (!category) return res.status(404).json({ error: "Categoría no encontrada" });

		await category.destroy(); // sets deletedAt when paranoid=true
		
		// Auto-export data to frontend
		await autoExport();
		
		res.json({ message: "Categoría eliminada (soft delete)", id });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Get all categories (exclude soft-deleted by default)
export const getCategories = async (req, res) => {
	try {
		const categories = await Category.findAll({ include: [] });
		res.json(categories);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Get category by id
export const getCategoryById = async (req, res) => {
	try {
		const { id } = req.params;
		const category = await Category.findByPk(id);
		if (!category) return res.status(404).json({ error: "Categoría no encontrada" });

		res.json(category);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Optionally: restore a soft-deleted category
export const restoreCategory = async (req, res) => {
	try {
		const { id } = req.params;
		const category = await Category.findByPk(id, { paranoid: false });
		if (!category) return res.status(404).json({ error: "Categoría no encontrada" });

		await category.restore();
		res.json({ message: "Categoría restaurada", category });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
