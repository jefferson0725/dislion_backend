import { Settings } from "../src/models/index.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Script de seed para insertar datos iniciales en la base de datos
 * Ejecutar con: npm run db:seed
 */

async function seed() {
  try {
    console.log("Iniciando seed de datos iniciales...");

    // Verificar si ya existen datos en Settings
    const existingSettings = await Settings.count();
    
    if (existingSettings > 0) {
      console.log("Ya existen configuraciones en la base de datos");
      console.log("   Configuraciones existentes: " + existingSettings);
      
      // Preguntar si desea continuar (simplemente mostrar advertencia)
      console.log("\nSi deseas reiniciar los datos:");
      console.log("   1. Ejecuta: npm run migrate:undo");
      console.log("   2. Ejecuta: npm run migrate");
      console.log("   3. Ejecuta: npm run db:seed");
      process.exit(0);
    }

    // Insertar configuraciones iniciales
    console.log("\nInsertando configuraciones iniciales...");

    const defaultSettings = [
      {
        key: 'whatsapp_number',
        value: '573007571199',
        description: 'Número de WhatsApp para contacto'
      },
      {
        key: 'show_prices',
        value: 'true',
        description: 'Mostrar precios en el catálogo'
      },
      {
        key: 'store_name',
        value: 'DISLION',
        description: 'Nombre de la tienda'
      },
      {
        key: 'currency',
        value: 'COP',
        description: 'Moneda de la tienda'
      },
      {
        key: 'contact_phone',
        value: '+57 300 757 1199',
        description: 'Teléfono de contacto para el footer'
      },
      {
        key: 'contact_email',
        value: 'contacto@dislion.com',
        description: 'Email de contacto para el footer'
      },
      {
        key: 'contact_address',
        value: 'Calle 123 #45-67, Bogotá, Colombia',
        description: 'Dirección física de la tienda'
      },
      {
        key: 'show_address',
        value: 'true',
        description: 'Mostrar dirección en el footer'
      }
    ];

    for (const setting of defaultSettings) {
      await Settings.create(setting);
      console.log(`  - Configuración '${setting.key}' creada`);
    }

    console.log("\nSeed completado exitosamente!");
    console.log("\nConfiguraciones creadas:");
    console.log("  - whatsapp_number: 573007571199");
    console.log("  - show_prices: true");
    console.log("  - store_name: DISLION");
    console.log("  - currency: COP");
    
    console.log("\nPróximo paso:");
    console.log("  Crear usuario administrador: npm run create-user");

    process.exit(0);
  } catch (error) {
    console.error("\nError en el seed:");
    console.error(error);
    process.exit(1);
  }
}

seed();
