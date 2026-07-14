'use strict';

const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { setupTestDb, seedTestAdmin, cleanDb, createTestToken } = require('./setup');

let db;
let app;
let token;

beforeAll(() => {
  process.env.JWT_SECRET = 'test_secret_for_testing_only';
  process.env.ADMIN_USERNAME = 'testadmin';
  process.env.ADMIN_PASSWORD = 'testpassword123';

  db = setupTestDb();
  seedTestAdmin(db);
  token = createTestToken();

  delete require.cache[require.resolve('../server')];
  app = require('../server');
});

beforeEach(() => {
  cleanDb(db);
});

afterAll(() => {
  if (db && db.close) {
    db.close();
  }
});

describe('GET /api/watches', () => {
  it('debería devolver array vacío cuando no hay relojes', async () => {
    const res = await request(app).get('/api/watches');
    expect(res.status).toBe(200);
    expect(res.body.watches).toEqual([]);
  });

  it('debería listar los relojes existentes', async () => {
    const WatchModel = require('../models/watchModel');
    WatchModel.create({
      name: 'Test Watch',
      description: 'Un reloj de prueba',
      price: 5000,
      imagePath: '/uploads/test.jpg',
    });

    const res = await request(app).get('/api/watches');
    expect(res.status).toBe(200);
    expect(res.body.watches).toHaveLength(1);
    expect(res.body.watches[0].name).toBe('Test Watch');
  });
});

describe('GET /api/watches/:id', () => {
  it('debería devolver un reloj por ID', async () => {
    const WatchModel = require('../models/watchModel');
    const created = WatchModel.create({
      name: 'Omega',
      description: 'Speedmaster',
      price: 8000,
      imagePath: '/uploads/omega.jpg',
    });

    const res = await request(app).get(`/api/watches/${created.id}`);
    expect(res.status).toBe(200);
    expect(res.body.watch.name).toBe('Omega');
  });

  it('debería devolver 404 si no existe', async () => {
    const res = await request(app).get('/api/watches/9999');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/watches', () => {
  const testImagePath = path.join(__dirname, 'test-image.jpg');

  beforeAll(() => {
    // Crear una imagen de prueba
    if (!fs.existsSync(testImagePath)) {
      fs.writeFileSync(testImagePath, Buffer.alloc(100));
    }
  });

  afterAll(() => {
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });

  it('debería crear un reloj (autenticado)', async () => {
    const res = await request(app)
      .post('/api/watches')
      .set('Cookie', [`token=${token}`])
      .field('name', 'Nuevo Rolex')
      .field('description', 'Submariner 2024')
      .field('price', '15000')
      .attach('image', testImagePath);

    expect(res.status).toBe(201);
    expect(res.body.watch).toBeDefined();
    expect(res.body.watch.name).toBe('Nuevo Rolex');
  });

  it('debería fallar sin autenticación', async () => {
    const res = await request(app)
      .post('/api/watches')
      .field('name', 'Test')
      .field('description', 'Test')
      .attach('image', testImagePath);

    expect(res.status).toBe(401);
  });

  it('debería fallar sin nombre', async () => {
    const res = await request(app)
      .post('/api/watches')
      .set('Cookie', [`token=${token}`])
      .field('description', 'Test')
      .attach('image', testImagePath);

    expect(res.status).toBe(400);
  });

  it('debería fallar sin imagen', async () => {
    const res = await request(app)
      .post('/api/watches')
      .set('Cookie', [`token=${token}`])
      .field('name', 'Test')
      .field('description', 'Test');

    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/watches/:id/toggle-sold-out', () => {
  it('debería alternar sold out (autenticado)', async () => {
    const WatchModel = require('../models/watchModel');
    const created = WatchModel.create({
      name: 'Test',
      description: 'Test',
      price: 1000,
      imagePath: '/uploads/test.jpg',
    });

    const res = await request(app)
      .patch(`/api/watches/${created.id}/toggle-sold-out`)
      .set('Cookie', [`token=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.watch.is_sold_out).toBe(1);
  });

  it('debería fallar sin autenticación', async () => {
    const WatchModel = require('../models/watchModel');
    const created = WatchModel.create({
      name: 'Test',
      description: 'Test',
      price: 1000,
      imagePath: '/uploads/test.jpg',
    });

    const res = await request(app)
      .patch(`/api/watches/${created.id}/toggle-sold-out`);

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/watches/:id', () => {
  it('debería eliminar un reloj (autenticado)', async () => {
    const WatchModel = require('../models/watchModel');
    const created = WatchModel.create({
      name: 'Para borrar',
      description: 'Test',
      price: 500,
      imagePath: '/uploads/delete-me.jpg',
    });

    const res = await request(app)
      .delete(`/api/watches/${created.id}`)
      .set('Cookie', [`token=${token}`]);

    expect(res.status).toBe(200);
    expect(WatchModel.findById(created.id)).toBeUndefined();
  });

  it('debería devolver 404 si no existe', async () => {
    const res = await request(app)
      .delete('/api/watches/9999')
      .set('Cookie', [`token=${token}`]);

    expect(res.status).toBe(404);
  });
});
