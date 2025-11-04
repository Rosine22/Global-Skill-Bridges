const request = require('supertest');
const app = require('../app');

describe('Backend API', () => {
  it('should respond with 200 on the root route', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });
});
