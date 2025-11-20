import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
import { User } from '../src/models/user.model.js';
import { sequelize } from '../src/config/db.js';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a base de datos exitosa\n');

    const username = await question('Nombre de usuario: ');
    const email = await question('Email: ');
    const password = await question('Contraseña: ');
    const roleInput = await question('Rol (admin/customer) [customer]: ');
    const role = roleInput.trim() || 'customer';

    if (!username || !email || !password) {
      console.error('Todos los campos son obligatorios');
      process.exit(1);
    }

    const hashed = await bcrypt.hash(password, 10);

    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: { username, email, password: hashed, role },
    });

    if (!created) {
      user.username = username;
      user.password = hashed;
      user.role = role;
      await user.save();
      console.log('\nUsuario actualizado exitosamente');
    } else {
      console.log('\nUsuario creado exitosamente');
    }

    console.log({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    rl.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    rl.close();
    process.exit(1);
  }
}

main();
