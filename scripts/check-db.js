import { sequelize } from "../src/config/db.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Script para verificar la conexión a la base de datos
 * Ejecutar con: node scripts/check-db.js
 */

async function checkDatabase() {
  try {
    console.log("Verificando conexión a la base de datos...");
    console.log("\nConfiguración:");
    console.log(`  - Host: ${process.env.DB_HOST}`);
    console.log(`  - Puerto: ${process.env.DB_PORT}`);
    console.log(`  - Base de datos: ${process.env.DB_NAME}`);
    console.log(`  - Usuario: ${process.env.DB_USER}`);

    await sequelize.authenticate();
    console.log("\nConexión exitosa!");

    // Obtener información de las tablas
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    if (tables.length > 0) {
      console.log("\nTablas existentes:");
      tables.forEach((table, index) => {
        console.log(`  ${index + 1}. ${table.table_name}`);
      });
    } else {
      console.log("\nNo hay tablas en la base de datos");
      console.log("   Ejecuta: npm run migrate");
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("\nError de conexión:");
    console.error(error.message);
    console.log("\nVerifica:");
    console.log("  1. PostgreSQL está corriendo");
    console.log("  2. Las credenciales en .env son correctas");
    console.log("  3. La base de datos existe");
    process.exit(1);
  }
}

checkDatabase();
