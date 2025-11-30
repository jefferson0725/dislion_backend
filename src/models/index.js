import { sequelize } from "../config/db.js";
import { User } from "./user.model.js";
import { Category } from "./category.model.js";
import { Product } from "./product.model.js";
import RefreshToken from "./refreshToken.model.js";
import { Settings } from "./settings.model.js";
import { ProductSize } from "./productSize.model.js";

// Relations
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });

// Product sizes relation
Product.hasMany(ProductSize, { foreignKey: "productId", as: "sizes" });
ProductSize.belongsTo(Product, { foreignKey: "productId", as: "product" });

// Refresh tokens relation
RefreshToken.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" });

export { sequelize, User, Category, Product, RefreshToken, Settings, ProductSize };
