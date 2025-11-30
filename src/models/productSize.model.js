import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Product } from "./product.model.js";

export const ProductSize = sequelize.define("ProductSize", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    field: "product_id",
    references: {
      model: Product,
      key: "id"
    },
    onDelete: "CASCADE"
  },
  size: { type: DataTypes.STRING(100), allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  image: { type: DataTypes.STRING(255) }, // URL or path to size-specific image
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: "created_at" },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: "updated_at" },
}, {
  tableName: "product_sizes",
  timestamps: true,
  underscored: true,
});
