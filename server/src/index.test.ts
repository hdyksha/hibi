import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app, server } from './index';

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

    expect(response.body).toEqual({
      status: 'OK',
      message: 'Todo App Server is running'
    });
  });

  it('should have CORS middleware configured', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBeDefined();
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