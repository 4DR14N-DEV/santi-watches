'use strict';

const { setupTestDb, seedTestAdmin, cleanDb } = require('./setup');

let db;

beforeAll(() => {
  process.env.JWT_SECRET = 'test_secret_for_testing_only';
  process.env.ADMIN_USERNAME = 'testadmin';
  process.env.ADMIN_PASSWORD = 'testpassword123';
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

describe('UserModel', () => {
  const UserModel = require('../models/userModel');

  describe('create', () => {
    it('debería crear un usuario correctamente', () => {
      const result = UserModel.create('admin', 'hash123');
      expect(result.changes).toBe(1);
      expect(result.lastInsertRowid).toBeDefined();
    });

    it('debería fallar si el username ya existe', () => {
      UserModel.create('admin', 'hash123');
      expect(() => UserModel.create('admin', 'hash456')).toThrow();
    });
  });

  describe('findByUsername', () => {
    it('debería encontrar un usuario existente', () => {
      UserModel.create('admin', 'hash123');
      const user = UserModel.findByUsername('admin');
      expect(user).toBeDefined();
      expect(user.username).toBe('admin');
      expect(user.password_hash).toBe('hash123');
    });

    it('debería devolver undefined si el usuario no existe', () => {
      const user = UserModel.findByUsername('noexiste');
      expect(user).toBeUndefined();
    });
  });

  describe('count', () => {
    it('debería devolver 0 cuando no hay usuarios', () => {
      expect(UserModel.count()).toBe(0);
    });

    it('debería contar correctamente los usuarios', () => {
      UserModel.create('admin1', 'hash1');
      UserModel.create('admin2', 'hash2');
      expect(UserModel.count()).toBe(2);
    });
  });
});
