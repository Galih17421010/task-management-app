const request = require('supertest');
const app = require('../src/server');

describe('Task API', () => {
  let token;

  beforAll(async () => {
    // Login for get token 
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    token = res.body.token;
  });

  test('GET /api/tasks - should return all tasks', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Autorization', `Bearer ${token}`)
      .send({
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high'  
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Task');
  });
});