/**
 * models/userModel.js
 *
 * Modelo del usuario administrador. La tienda solo tiene UN usuario
 * (el admin), por eso el modelo no expone un "create" público: el
 * único punto de creación es el seed inicial en server.js, a partir
 * de las variables de entorno ADMIN_USERNAME / ADMIN_PASSWORD.
 */

'use strict';

const { db } = require('../config/database');

const UserModel = {
  /**
   * Busca un usuario por su nombre de usuario.
   * @param {string} username
   * @returns {object|undefined}
   */
  findByUsername(username) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
  },

  /**
   * Cuenta cuántos usuarios existen (usado para el seed inicial).
   * @returns {number}
   */
  count() {
    const stmt = db.prepare('SELECT COUNT(*) AS total FROM users');
    return stmt.get().total;
  },

  /**
   * Crea el usuario administrador. Solo debe usarse desde el seed.
   * @param {string} username
   * @param {string} passwordHash
   */
  create(username, passwordHash) {
    const stmt = db.prepare(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)'
    );
    return stmt.run(username, passwordHash);
  },
};

module.exports = UserModel;
