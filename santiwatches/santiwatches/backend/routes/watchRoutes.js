/**
 * routes/watchRoutes.js
 *
 * Rutas públicas: ver relojes (GET).
 * Rutas protegidas: crear, marcar agotado/disponible, eliminar
 * (requieren sesión de administrador vía requireAuth).
 */

'use strict';

const express = require('express');
const router = express.Router();

const WatchController = require('../controllers/watchController');
const { requireAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// --- Públicas ---
router.get('/', WatchController.getAll);
router.get('/:id', WatchController.getOne);

// --- Protegidas (solo admin) ---
router.post('/', requireAuth, upload.single('image'), WatchController.create);
router.patch('/:id/toggle-sold-out', requireAuth, WatchController.toggleSoldOut);
router.delete('/:id', requireAuth, WatchController.delete);

module.exports = router;
