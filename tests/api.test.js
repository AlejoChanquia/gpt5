const request = require('supertest');
const app = require('../src/server');
const db = require('../src/db');

describe('API', () => {
  beforeAll(done => {
    db.serialize(() => {
      db.run('DELETE FROM courses');
      db.run('DELETE FROM users', done);
    });
  });

  let token = '';

  test('register teacher', async () => {
    const res = await request(app).post('/api/register').send({
      name: 'Prof',
      email: 'prof@example.com',
      password: 'pass',
      role: 'teacher'
    });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('prof@example.com');
  });

  test('login teacher', async () => {
    const res = await request(app).post('/api/login').send({
      email: 'prof@example.com',
      password: 'pass'
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
    expect(res.body.preferences).toBeNull();
  });

  test('create course', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', 'Bearer ' + token)
      .send({ title: 'Matemáticas', description: 'Básico', content: 'Contenido' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Matemáticas');
  });

  test('list courses', async () => {
    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('search courses', async () => {
    const res = await request(app).get('/api/courses?search=Mate');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Matemáticas');
  });

  test('set preferences', async () => {
    const res = await request(app)
      .put('/api/preferences')
      .set('Authorization', 'Bearer ' + token)
      .send({ preferences: 'math' });
    expect(res.status).toBe(200);
  });

  test('login returns preferences', async () => {
    const res = await request(app).post('/api/login').send({
      email: 'prof@example.com',
      password: 'pass'
    });
    expect(res.status).toBe(200);
    expect(res.body.preferences).toBe('math');
  });
});
