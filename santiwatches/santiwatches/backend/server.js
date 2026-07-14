/**
 * server.js
 *
 * Punto de entrada del backend de SantiWatches.
 * Arquitectura MVC:
 *   - models/      -> acceso a datos (SQLite vía node:sqlite)
 *   - controllers/ -> lógica de negocio
 *   - routes/      -> definición de endpoints
 *   - middleware/  -> autenticación y subida de archivos
 *   - config/      -> conexión a BD y seed del admin
 */

'use strict';

require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const { initSchema } = require('./config/database');
const seedAdmin = require('./config/seedAdmin');

const authRoutes = require('./routes/authRoutes');
const watchRoutes = require('./routes/watchRoutes');

// 1. Preparamos la base de datos antes de levantar el servidor.
initSchema();
seedAdmin();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Seguridad ---
app.use(helmet());

// CORS: en desarrollo acepta todo; en producción whitelist desde CORS_ORIGIN
const corsOrigin = process.env.CORS_ORIGIN;
const corsOptions = corsOrigin
  ? { origin: corsOrigin.split(',').map((s) => s.trim()), credentials: true }
  : { origin: true, credentials: true };
app.use(cors(corsOptions));

// --- Middleware globales ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servimos las imágenes de los relojes subidas por el admin.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// En desarrollo sirve el frontend raw; en producción solo sirve si existe el build
const frontendDir = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '..', 'frontend', 'dist')
  : path.join(__dirname, '..', 'frontend');

if (fs.existsSync(frontendDir)) {
  app.use(express.static(frontendDir));
}

// --- Rutas de la API ---
app.use('/api/auth', authRoutes);
app.use('/api/watches', watchRoutes);

// SPA fallback solo si el frontend está presente
if (fs.existsSync(frontendDir)) {
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDir, 'index.html'));
  });
}

// --- Manejo de errores centralizado ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor.',
  });
});

// Solo escuchar si no es test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n  SantiWatches backend corriendo en http://localhost:${PORT}\n`);
  });
}

module.exports = app;
