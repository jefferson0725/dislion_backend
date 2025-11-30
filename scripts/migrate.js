import { sequelize } from "../src/config/db.js";
import { User, Category, Product, RefreshToken, Settings, ProductSize } from "../src/models/index.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Script de migraciones para crear/actualizar tablas en la base de datos
 * Ejecutar con: npm run migrate
 */

async function migrate() {
  try {
    console.log("Iniciando migraciones...");
    console.log(`Base de datos: ${process.env.DB_NAME}`);
    console.log(`Host: ${process.env.DB_HOST}`);
    
    // Probar conexión
    await sequelize.authenticate();
    console.log("Conexión a base de datos exitosa");

    // Sincronizar modelos (crear tablas)
    console.log("\nCreando/actualizando tablas...");
    
    // Orden de creación para respetar foreign keys
    await User.sync({ alter: true });
    console.log("  - Tabla 'users' sincronizada");

    await Category.sync({ alter: true });
    console.log("  - Tabla 'categories' sincronizada");

    await Product.sync({ alter: true });
    console.log("  - Tabla 'products' sincronizada");

    await ProductSize.sync({ alter: true });
    console.log("  - Tabla 'product_sizes' sincronizada");

    await RefreshToken.sync({ alter: true });
    console.log("  - Tabla 'refresh_tokens' sincronizada");

    await Settings.sync({ alter: true });
    console.log("  - Tabla 'settings' sincronizada");

    console.log("\nMigraciones completadas exitosamente!");
    console.log("\nPróximos pasos:");
    console.log("  1. Ejecutar: npm run db:seed (para datos iniciales)");
    console.log("  2. Ejecutar: npm run create-user (para crear admin)");
    console.log("  3. Iniciar servidor: npm start");

    process.exit(0);
  } catch (error) {
    console.error("\nError en las migraciones:");
    console.error(error);
    process.exit(1);
  }
}

migrate();
