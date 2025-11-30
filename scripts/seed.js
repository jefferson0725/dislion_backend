import { Settings } from "../src/models/index.js";
import { sequelize } from "../src/config/db.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Script de seed para insertar datos iniciales en la base de datos
 * Ejecutar con: npm run db:seed
 */

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("✓ Conexión a base de datos exitosa\n");

    console.log("Inicializando configuraciones...\n");

    const defaultSettings = [
      {
        key: 'whatsapp_number',
        value: '573007571199',
        description: 'Número de WhatsApp para contacto'
      },
      {
        key: 'show_prices',
        value: 'false',
        description: 'Mostrar precios en el catálogo'
      },
      {
        key: 'show_address',
        value: 'false',
        description: 'Mostrar dirección en el footer'
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
        description: 'Teléfono de contacto'
      },
      {
        key: 'contact_email',
        value: 'contacto@dislion.com',
        description: 'Email de contacto'
      },
      {
        key: 'contact_address',
        value: 'Calle 123 #45-67, Bogotá, Colombia',
        description: 'Dirección física'
      }
    ];

    let createdCount = 0;
    let existingCount = 0;

    for (const setting of defaultSettings) {
      const [record, created] = await Settings.findOrCreate({
        where: { key: setting.key },
        defaults: setting,
      });

      if (created) {
        console.log(`✓ Creada setting: ${setting.key}`);
        createdCount++;
      } else {
        console.log(`  Setting existente: ${setting.key}`);
        existingCount++;
      }
    }

    console.log(`\n✓ Seed completado exitosamente!`);
    console.log(`  Creadas: ${createdCount}`);
    console.log(`  Existentes: ${existingCount}`);

    process.exit(0);
  } catch (error) {
    console.error("\n✗ Error en el seed:");
    console.error(error);
    process.exit(1);
  }
}

seed();
