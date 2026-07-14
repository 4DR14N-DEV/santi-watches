/**
 * models/watchModel.js
 *
 * Modelo de acceso a datos para los relojes (productos) de la tienda.
 * Toda la lógica SQL vive aquí; los controladores nunca escriben SQL
 * directamente (separación de responsabilidades propia de MVC).
 */

'use strict';

const { db } = require('../config/database');

const WatchModel = {
  /**
   * Devuelve todos los relojes, más nuevos primero.
   */
  findAll() {
    const stmt = db.prepare('SELECT * FROM watches ORDER BY created_at DESC');
    return stmt.all();
  },

  /**
   * Busca un reloj por id.
   */
  findById(id) {
    const stmt = db.prepare('SELECT * FROM watches WHERE id = ?');
    return stmt.get(id);
  },

  /**
   * Crea un nuevo reloj.
   * El precio es opcional (puede ser null): así lo pide el negocio,
   * ya que algunas piezas de alta gama se cotizan solo por consulta.
   */
  create({ name, description, price, imagePath }) {
    const stmt = db.prepare(`
      INSERT INTO watches (name, description, price, image_path)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(name, description, price ?? null, imagePath);
    return this.findById(info.lastInsertRowid);
  },

  /**
   * Actualiza los campos editables de un reloj.
   */
  update(id, { name, description, price, imagePath }) {
    const current = this.findById(id);
    if (!current) return null;

    const stmt = db.prepare(`
      UPDATE watches
      SET name = ?, description = ?, price = ?, image_path = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    stmt.run(
      name ?? current.name,
      description ?? current.description,
      price === undefined ? current.price : price,
      imagePath ?? current.image_path,
      id
    );
    return this.findById(id);
  },

  /**
   * Alterna el estado "agotado" de un reloj (no lo borra ni lo
   * desactiva de verdad: solo marca la bandera is_sold_out que el
   * frontend usa para mostrar la cinta de "Agotado" y bajar el
   * opacity de la card).
   */
  toggleSoldOut(id) {
    const current = this.findById(id);
    if (!current) return null;

    const newValue = current.is_sold_out ? 0 : 1;
    const stmt = db.prepare(`
      UPDATE watches
      SET is_sold_out = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    stmt.run(newValue, id);
    return this.findById(id);
  },

  /**
   * Elimina un reloj definitivamente (uso administrativo, distinto
   * de marcarlo como agotado).
   */
  delete(id) {
    const stmt = db.prepare('DELETE FROM watches WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  },
};

module.exports = WatchModel;
