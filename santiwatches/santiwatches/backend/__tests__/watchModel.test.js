'use strict';

const { setupTestDb, cleanDb } = require('./setup');
const { getDb } = require('../config/database');

let db;

beforeAll(() => {
  process.env.JWT_SECRET = 'test_secret_for_testing_only';
  db = setupTestDb();
});

beforeEach(() => {
  cleanDb(db);
});

afterAll(() => {
  if (db && db.close) {
    db.close();
  }
});

describe('WatchModel', () => {
  const WatchModel = require('../models/watchModel');

  const sampleWatch = {
    name: 'Rolex Submariner',
    description: 'Reloj deportivo de lujo',
    price: 12000,
    imagePath: '/uploads/watch-test.jpg',
  };

  describe('create', () => {
    it('debería crear un reloj correctamente', () => {
      const watch = WatchModel.create(sampleWatch);
      expect(watch).toBeDefined();
      expect(watch.id).toBeDefined();
      expect(watch.name).toBe('Rolex Submariner');
      expect(watch.price).toBe(12000);
      expect(watch.is_sold_out).toBe(0);
    });

    it('debería permitir precio null', () => {
      const watch = WatchModel.create({ ...sampleWatch, price: null });
      expect(watch.price).toBeNull();
    });

    it('debería manejar precio undefined como null', () => {
      const { price, ...noPrice } = sampleWatch;
      const watch = WatchModel.create(noPrice);
      expect(watch.price).toBeNull();
    });
  });

  describe('findAll', () => {
    it('debería devolver array vacío cuando no hay relojes', () => {
      const watches = WatchModel.findAll();
      expect(watches).toEqual([]);
    });

    it('debería devolver todos los relojes ordenados por fecha descendente', () => {
      const first = WatchModel.create({ ...sampleWatch, name: 'Primero' });
      // Forzar una fecha diferente para el segundo registro
      const db = getDb();
      db.prepare("UPDATE watches SET created_at = datetime('now', '-1 minute') WHERE id = ?").run(first.id);
      WatchModel.create({ ...sampleWatch, name: 'Segundo' });
      const watches = WatchModel.findAll();
      expect(watches).toHaveLength(2);
      expect(watches[0].name).toBe('Segundo');
      expect(watches[1].name).toBe('Primero');
    });
  });

  describe('findById', () => {
    it('debería encontrar un reloj por ID', () => {
      const created = WatchModel.create(sampleWatch);
      const found = WatchModel.findById(created.id);
      expect(found).toBeDefined();
      expect(found.name).toBe('Rolex Submariner');
    });

    it('debería devolver undefined si no existe', () => {
      const found = WatchModel.findById(9999);
      expect(found).toBeUndefined();
    });
  });

  describe('update', () => {
    it('debería actualizar los campos modificados', () => {
      const created = WatchModel.create(sampleWatch);
      const updated = WatchModel.update(created.id, {
        name: 'Omega Speedmaster',
        price: 8000,
      });
      expect(updated.name).toBe('Omega Speedmaster');
      expect(updated.price).toBe(8000);
      expect(updated.description).toBe(sampleWatch.description);
    });

    it('debería devolver null si el reloj no existe', () => {
      const result = WatchModel.update(9999, { name: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('toggleSoldOut', () => {
    it('debería alternar is_sold_out de 0 a 1', () => {
      const created = WatchModel.create(sampleWatch);
      const toggled = WatchModel.toggleSoldOut(created.id);
      expect(toggled.is_sold_out).toBe(1);
    });

    it('debería alternar is_sold_out de 1 a 0', () => {
      const created = WatchModel.create(sampleWatch);
      WatchModel.toggleSoldOut(created.id);
      const toggledAgain = WatchModel.toggleSoldOut(created.id);
      expect(toggledAgain.is_sold_out).toBe(0);
    });

    it('debería devolver null si el reloj no existe', () => {
      const result = WatchModel.toggleSoldOut(9999);
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('debería eliminar un reloj existente', () => {
      const created = WatchModel.create(sampleWatch);
      const deleted = WatchModel.delete(created.id);
      expect(deleted).toBe(true);
      expect(WatchModel.findById(created.id)).toBeUndefined();
    });

    it('debería devolver false si el reloj no existe', () => {
      const deleted = WatchModel.delete(9999);
      expect(deleted).toBe(false);
    });
  });
});
