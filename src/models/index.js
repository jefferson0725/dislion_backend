import { sequelize } from "../config/db.js";
import { User } from "./user.model.js";
import { Category } from "./category.model.js";
import { Product } from "./product.model.js";
import RefreshToken from "./refreshToken.model.js";
import { Settings } from "./settings.model.js";

// Relations
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });

// Refresh tokens relation
RefreshToken.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" });

export { sequelize, User, Category, Product, RefreshToken, Settings };
