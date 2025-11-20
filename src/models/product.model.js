import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Category } from "./category.model.js";

export const Product = sequelize.define("Product", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  image: { type: DataTypes.STRING(255) }, // URL or path
  displayOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: "display_order" },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: "created_at" },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: "updated_at" },
  deletedAt: { type: DataTypes.DATE, field: "deleted_at" },
}, {
  tableName: "products",
  timestamps: true,
  underscored: true,
  paranoid: true,
});


