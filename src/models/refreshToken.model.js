import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const RefreshToken = sequelize.define("RefreshToken", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tokenHash: { type: DataTypes.STRING(200), allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
  expiresAt: { type: DataTypes.DATE },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: "created_at" },
}, {
  tableName: "refresh_tokens",
  timestamps: true,
  underscored: true,
});

export default RefreshToken;
