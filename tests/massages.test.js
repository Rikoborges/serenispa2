const request = require('supertest');
const app = require('../index'); // Votre fichier serveur


describe('Tests des Massages SereniSpa', () => {
  it('Doit retourner un code 200 pour la liste des massages', async () => {
    const res = await request(app).get('/api/massages');
    expect(res.statusCode).toBe(200);
  });

  it('Doit limiter les résultats à 2 quand on le demande', async () => {
    const res = await request(app).get('/api/massages?limit=2');
    expect(res.body.length).toBeLessThanOrEqual(2);
  });
});

const mongoose = require('mongoose');

// Após todos os testes terminarem
afterAll(async () => {
  await mongoose.connection.close(); // Fecha a conexão
});