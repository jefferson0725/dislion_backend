import { sequelize } from "../src/config/db.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Script para revertir migraciones (eliminar todas las tablas)
 * CUIDADO: Esto eliminará TODOS los datos
 * Ejecutar con: npm run migrate:undo
 */

async function migrateUndo() {
  try {
    console.log("ADVERTENCIA: Esto eliminará todas las tablas y datos");
    console.log("Base de datos: " + process.env.DB_NAME);
    
    // Esperar 3 segundos para que el usuario pueda cancelar
    console.log("\nCancelando en 3 segundos... (Ctrl+C para cancelar)");
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("\nEliminando tablas...");
    
    // Probar conexión
    await sequelize.authenticate();
    console.log("Conexión a base de datos exitosa");

    // Eliminar todas las tablas
    await sequelize.drop();
    console.log("Todas las tablas eliminadas");

    console.log("\nReversión completada");
    console.log("Para recrear las tablas, ejecuta: npm run migrate");

    process.exit(0);
  } catch (error) {
    console.error("\nError al revertir migraciones:");
    console.error(error);
    process.exit(1);
  }
}

migrateUndo();
