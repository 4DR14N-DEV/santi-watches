/**
 * config/database.js
 *
 * Capa de conexión a la base de datos.
 *
 * Usamos el módulo NATIVO `node:sqlite` (disponible desde Node 22.5+),
 * en vez de paquetes como `better-sqlite3` o `sqlite3`. La razón es
 * puramente práctica: esos paquetes traen bindings nativos en C++ que
 * deben compilarse con node-gyp en el momento de instalar. Con
 * `node:sqlite` no hay nada que compilar: viene incluido en Node,
 * así que `npm install` es instantáneo y no depende de tener
 * herramientas de compilación (build-essential, python, etc.) en la
 * máquina del desarrollador.
 *
 * La API es síncrona (igual que better-sqlite3), lo cual es ideal
 * para un proyecto de este tamaño: no necesitamos manejar callbacks
 * ni promesas para operaciones de base de datos que tardan
 * microsegundos.
 */

'use strict';

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '..', 'database');
const DB_PATH = path.join(DB_DIR, 'santiwatches.sqlite');

// Nos aseguramos de que exista el directorio /database
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

// Buenas prácticas de SQLite para una app web pequeña:
// - WAL mejora la concurrencia lectura/escritura.
// - foreign_keys asegura integridad referencial.
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

/**
 * Crea las tablas si no existen todavía. Se llama una sola vez
 * al arrancar el servidor (ver server.js).
 */
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS watches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL,
      image_path TEXT NOT NULL,
      is_sold_out INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

module.exports = { db, initSchema, DB_PATH };
