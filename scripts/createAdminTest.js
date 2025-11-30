import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
import { User } from '../src/models/user.model.js';
import { sequelize } from '../src/config/db.js';

/**
 * createAdminTest.js
 * execute: npm run create-admin-test
 */

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión a base de datos exitosa\n');

    // data of test
    const testAdmin = {
      username: 'test',
      email: 'test@test.com',
      password: 'admin123',
      role: 'admin'
    };

    console.log('Creando usuario admin de prueba...');
    console.log(`  Email: ${testAdmin.email}`);
    console.log(`  Usuario: ${testAdmin.username}`);
    console.log(`  Contraseña: ${testAdmin.password}`);
    console.log(`  Rol: ${testAdmin.role}\n`);

    // Verificar si ya existe
    let user = await User.findOne({ where: { email: testAdmin.email } });

    if (user) {
      console.log('✓ Usuario admin ya existe\n');
      console.log('Datos:');
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Usuario: ${user.username}`);
      console.log(`  Rol: ${user.role}`);
    } else {
      // Crear nuevo usuario
      const hashed = await bcrypt.hash(testAdmin.password, 10);
      
      try {
        user = await User.create({
          username: testAdmin.username,
          email: testAdmin.email,
          password: hashed,
          role: testAdmin.role
        });

        console.log('✓ Usuario admin creado exitosamente\n');
        console.log('Credenciales:');
        console.log(`  ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Usuario: ${user.username}`);
        console.log(`  Rol: ${user.role}`);
      } catch (createErr) {
        if (createErr.name === 'SequelizeUniqueConstraintError') {
          console.error('✗ Error: El usuario o email ya existe en la base de datos');
          console.log('  Intenta con diferentes valores de username o email');
        } else {
          throw createErr;
        }
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

main();
