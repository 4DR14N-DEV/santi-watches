'use strict';

const request = require('supertest');
const { setupTestDb, seedTestAdmin, cleanDb, createTestToken } = require('./setup');

let db;
let app;
let adminCredentials;

beforeAll(() => {
  process.env.JWT_SECRET = 'test_secret_for_testing_only';
  process.env.ADMIN_USERNAME = 'testadmin';
  process.env.ADMIN_PASSWORD = 'testpassword123';

  db = setupTestDb();
  adminCredentials = seedTestAdmin(db);

  // Importar app DESPUÉS de configurar la DB
  delete require.cache[require.resolve('../server')];
  app = require('../server');
});

beforeEach(() => {
  cleanDb(db);
  seedTestAdmin(db);
});

afterAll(() => {
  if (db && db.close) {
    db.close();
  }
});

describe('POST /api/auth/login', () => {
  it('debería login exitoso con credenciales correctas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: adminCredentials.username,
        password: adminCredentials.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Sesión iniciada/);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.username).toBe(adminCredentials.username);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('debería fallar con credenciales incorrectas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: adminCredentials.username,
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/incorrectos/);
  });

  it('debería fallar si falta username', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'test' });

    expect(res.status).toBe(400);
  });

  it('debería fallar si falta password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/logout', () => {
  it('debería cerrar sesión correctamente', async () => {
    const res = await request(app)
      .post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/cerrada/);
  });
});

describe('GET /api/auth/me', () => {
  it('debería devolver el usuario autenticado', async () => {
    const token = createTestToken();
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [`token=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.username).toBe('testadmin');
  });

  it('debería devolver 401 sin token', async () => {
    const res = await request(app)
      .get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  it('debería devolver 401 con token inválido', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', ['token=invalid_token']);

    expect(res.status).toBe(401);
  });
});
