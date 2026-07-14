/**
 * controllers/watchController.js
 *
 * Lógica de negocio para los relojes. El controlador orquesta:
 * valida entrada -> llama al modelo -> devuelve JSON. No conoce
 * detalles de SQL (eso vive en watchModel.js) ni de rutas.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const WatchModel = require('../models/watchModel');

/**
 * Convierte la ruta absoluta del archivo subido en una URL pública
 * relativa que el frontend puede usar directamente en un <img src>.
 */
function toPublicImagePath(filename) {
  return `/uploads/${filename}`;
}

const WatchController = {
  /**
   * Lista pública de relojes. Cualquier visitante puede verla.
   */
  getAll(req, res) {
    const watches = WatchModel.findAll();
    return res.json({ watches });
  },

  getOne(req, res) {
    const watch = WatchModel.findById(req.params.id);
    if (!watch) {
      return res.status(404).json({ error: 'Reloj no encontrado.' });
    }
    return res.json({ watch });
  },

  /**
   * Crea un nuevo reloj. Solo accesible para el admin autenticado
   * (protegido por requireAuth en la ruta).
   * El precio es opcional: si no se envía, queda como null.
   */
  create(req, res) {
    const { name, description, price } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre del reloj es obligatorio.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'La descripción del reloj es obligatoria.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'La foto del reloj es obligatoria.' });
    }

    let parsedPrice = null;
    if (price !== undefined && price !== null && String(price).trim() !== '') {
      parsedPrice = Number(price);
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: 'El precio debe ser un número válido.' });
      }
    }

    const watch = WatchModel.create({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      imagePath: toPublicImagePath(req.file.filename),
    });

    return res.status(201).json({ message: 'Reloj creado correctamente.', watch });
  },

  /**
   * Alterna el estado de "agotado" de un reloj. No lo elimina ni
   * lo desactiva del sistema: solo cambia la bandera is_sold_out,
   * que el frontend usa para mostrar la cinta "AGOTADO" y aplicar
   * opacity reducido a la card completa.
   */
  toggleSoldOut(req, res) {
    const watch = WatchModel.toggleSoldOut(req.params.id);
    if (!watch) {
      return res.status(404).json({ error: 'Reloj no encontrado.' });
    }
    return res.json({
      message: watch.is_sold_out
        ? 'Reloj marcado como agotado.'
        : 'Reloj marcado como disponible.',
      watch,
    });
  },

  /**
   * Elimina un reloj definitivamente, incluida su imagen en disco.
   * Distinto de toggleSoldOut: esto sí borra el producto.
   */
  delete(req, res) {
    const watch = WatchModel.findById(req.params.id);
    if (!watch) {
      return res.status(404).json({ error: 'Reloj no encontrado.' });
    }

    const deleted = WatchModel.delete(req.params.id);
    if (deleted && watch.image_path) {
      const filePath = path.join(__dirname, '..', watch.image_path.replace('/uploads/', 'uploads/'));
      fs.unlink(filePath, () => {
        /* Si el archivo ya no existe, no es un error crítico. */
      });
    }

    return res.json({ message: 'Reloj eliminado.' });
  },
};

module.exports = WatchController;
