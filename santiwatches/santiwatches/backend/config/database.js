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

let db;

/**
 * Inicializa la conexión a la base de datos.
 * En producción usa un archivo; en tests usa :memory:.
 */
function connect(dbPath) {
  if (dbPath === ':memory:') {
    db = new DatabaseSync(':memory:');
  } else {
    const DB_DIR = path.dirname(dbPath);
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    db = new DatabaseSync(dbPath);
  }

  db.exec('PRAGMA foreign_keys = ON;');
  if (dbPath !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
  }

  return db;
}

// Conexión por defecto (producción) - solo si no es test
const PROD_DB_PATH = path.join(__dirname, '..', 'database', 'santiwatches.sqlite');
if (process.env.NODE_ENV !== 'test') {
  connect(PROD_DB_PATH);
}

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

function getDb() {
  return db;
}

module.exports = { db, getDb, connect, initSchema, DB_PATH: PROD_DB_PATH };
