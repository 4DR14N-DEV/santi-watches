'use strict';

const path = require('path');
const fs = require('fs');

/**
 * Configura una base de datos en memoria para tests.
 * Debe llamarse ANTES de importar cualquier modelo o controller.
 */
function setupTestDb() {
  // Limpiar cache de require para obtener una fresh connection
  delete require.cache[require.resolve('../config/database')];

  const { connect, initSchema } = require('../config/database');
  connect(':memory:');
  initSchema();

  return require('../config/database').getDb();
}

/**
 * Seedea un usuario admin para tests de autenticación.
 */
function seedTestAdmin(db) {
  const bcrypt = require('bcryptjs');
  const UserModel = require('../models/userModel');

  const username = process.env.ADMIN_USERNAME || 'testadmin';
  const password = process.env.ADMIN_PASSWORD || 'testpassword123';
  const hash = bcrypt.hashSync(password, 10);

  UserModel.create(username, hash);
  return { username, password };
}

/**
 * Crea un JWT válido para tests.
 */
function createTestToken(payload) {
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('../middleware/authMiddleware');
  return jwt.sign(
    { id: 1, username: 'testadmin', ...payload },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Limpia la DB después de cada test.
 */
function cleanDb(db) {
  db.exec('DELETE FROM watches');
  db.exec('DELETE FROM users');
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('watches', 'users')");
}

module.exports = { setupTestDb, seedTestAdmin, createTestToken, cleanDb };
