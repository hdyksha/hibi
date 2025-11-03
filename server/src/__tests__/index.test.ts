import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app, server } from '../index';

describe('Express Server Basic Setup', () => {
  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  it('should respond to health check endpoint', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'OK',
      message: 'Todo App Server is running',
      timestamp: expect.any(String),
      uptime: expect.any(Number)
    });
  });

  it('should have CORS middleware configured', async () => {
    const response = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:3000')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('should parse JSON requests', async () => {
    const testData = { test: 'data' };
    
    // Create a temporary endpoint to test JSON parsing
    app.post('/test-json', (req, res) => {
      res.json({ received: req.body });
    });

    const response = await request(app)
      .post('/test-json')
      .send(testData)
      .expect(200);

    expect(response.body.received).toEqual(testData);
  });
});