const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Massages API', () => {

  it('GET /api/massages doit retourner 200', async () => {
    const res = await request(app).get('/api/massages');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

});

describe('Reservations API - Sécurité', () => {

  it('POST /api/reservations sans token doit retourner 401', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .send({ massageId: '12345', date: '2026-05-20' });
    expect(res.statusCode).toBe(401);
  });

});