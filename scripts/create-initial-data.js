// Script para crear data.json inicial en producción
// Uso: node scripts/create-initial-data.js

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createInitialData() {
  try {
    // Determinar la ruta según el entorno
    const isProd = process.env.UPLOADS_PATH;
    const dataFilePath = isProd
      ? path.join(path.dirname(process.env.UPLOADS_PATH), "data.json")
      : path.join(__dirname, "../../frontend/public/data.json");

    // Verificar si ya existe
    try {
      await fs.access(dataFilePath);
      console.log(`⚠️  data.json ya existe en: ${dataFilePath}`);
      console.log("Si deseas recrearlo, elimínalo primero.");
      return;
    } catch (err) {
      // El archivo no existe, continuar
    }

    // Crear estructura inicial
    const initialData = {
      version: Date.now(),
      lastUpdated: new Date().toISOString(),
      settings: {
        whatsapp_number: "573007571199",
        show_prices: "false",
        show_carousel: "false",
        show_address: "false",
        store_name: "DISLION",
        currency: "COP",
        contact_phone: "+57 300 757 1199",
        contact_email: "contacto@dislion.com",
        contact_address: "Calle 123 #45-67, Ponedera, Colombia",
      },
      categories: [],
      products: [],
    };

    // Crear directorio si no existe
    const dataDir = path.dirname(dataFilePath);
    await fs.mkdir(dataDir, { recursive: true });

    // Escribir archivo
    await fs.writeFile(
      dataFilePath,
      JSON.stringify(initialData, null, 2),
      "utf8",
    );

    console.log("✅ data.json creado exitosamente en:", dataFilePath);
    console.log("");
    console.log("Ahora puedes:");
    console.log("1. Hacer login en el panel admin");
    console.log("2. Agregar productos y categorías");
    console.log("3. Los cambios se guardarán automáticamente en data.json");
    console.log("");
  } catch (error) {
    console.error("❌ Error creando data.json:", error);
    process.exit(1);
  }
}

createInitialData();
