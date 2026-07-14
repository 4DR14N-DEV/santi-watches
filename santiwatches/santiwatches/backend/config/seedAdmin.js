/**
 * config/seedAdmin.js
 *
 * Crea el único usuario administrador del sistema, tomando las
 * credenciales de las variables de entorno ADMIN_USERNAME y
 * ADMIN_PASSWORD. Si ya existe un usuario en la base de datos,
 * no hace nada (evita duplicados en reinicios del servidor).
 */

'use strict';

const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');

function seedAdmin() {
  if (UserModel.count() > 0) {
    return; // El admin ya existe, no hacemos nada.
  }

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.warn(
      '[SantiWatches] ADMIN_USERNAME o ADMIN_PASSWORD no están definidos en .env. ' +
      'No se creó ningún usuario administrador.'
    );
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  UserModel.create(username, passwordHash);
  console.log(`[SantiWatches] Usuario administrador "${username}" creado correctamente.`);
}

module.exports = seedAdmin;
