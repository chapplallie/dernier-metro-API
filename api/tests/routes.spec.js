const request = require('supertest');
const express = require('express');
let app;
let dbpool;

beforeAll(() => {
  const server = require('../server');
  app = server.app || server;
  dbpool = server.dbpool || app.locals.dbpool;

  // Mock dbpool.query for all tests
  jest.spyOn(dbpool, 'query').mockImplementation((sql, params) => {
    // /next-metro: known station
    if (sql.includes('FROM stations')) {
      if (params[0].toLowerCase() === 'chatelet') {
        return Promise.resolve({ rowCount: 1, rows: [{ name: 'chatelet' }] });
      }
      // /next-metro: unknown station
      return Promise.resolve({ rowCount: 0, rows: [] });
    }
    // /last-metro: config defaults
    if (sql.includes("FROM config WHERE key = 'metro.defaults'")) {
      return Promise.resolve({ rows: [{ value: { line: 'M7', tz: 'Europe/Paris' } }] });
    }
    // /last-metro: config last
  if (sql.includes("FROM config WHERE key = 'metro.last'")) {
  return Promise.resolve({ rows: [{ value: { chatelet: '01:10' } }] });
}
    // Default: simulate DB unavailable
    return Promise.reject(new Error('DB unavailable'));
  });
});

describe('/next-metro', () => {
  beforeEach(async () => {
    // Optionally reset DB state here
    // await dbpool.query('DELETE FROM stations');
    // await dbpool.query("INSERT INTO stations (name) VALUES ('Chatelet'), ('Nation'), ('La Défense')");
  });

  test('200: known station', async () => {
    const res = await request(app).get('/next-metro?station=Chatelet');
    expect(res.statusCode).toBe(200);
    expect(res.body.station).toBe('Chatelet');
  });

  test('404: unknown station', async () => {
    const res = await request(app).get('/next-metro?station=UnknownStation');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('unknown station');
  });

  test('500: DB unavailable', async () => {
    // Simulate DB error by mocking dbpool.query
    const originalQuery = dbpool.query;
    dbpool.query = jest.fn(() => Promise.reject(new Error('DB unavailable')));
    const res = await request(app).get('/next-metro?station=Chatelet');
    expect(res.statusCode).toBe(500);
    dbpool.query = originalQuery;
  });
});

describe('/last-metro', () => {
  test('200: known station', async () => {
    const res = await request(app).get('/last-metro?station=chatelet');
    expect(res.statusCode).toBe(200);
    expect(res.body.station).toBe('chatelet');
  });

  test('404: unknown station', async () => {
    const res = await request(app).get('/last-metro?station=UnknownStation');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('unknown station');
  });

  test('500: DB unavailable', async () => {
    const originalQuery = dbpool.query;
    dbpool.query = jest.fn(() => Promise.reject(new Error('DB unavailable')));
    const res = await request(app).get('/last-metro?station=chatelet');
    expect(res.statusCode).toBe(500);
    dbpool.query = originalQuery;
  });
});

describe('/db-health', () => {
    it('should return 200 when DB is up', async () => {
        const originalQuery = dbpool.query;
        dbpool.query = jest.fn((sql, params) => {
            // /db-health: health check
            if (sql && sql.includes('FROM information_schema.tables')) {
                return Promise.resolve({ rows: [{}] });
            }
            return originalQuery(sql, params);
        });

        try {
            await request(app).get('/db-health').expect(200);
        } finally {
            dbpool.query = originalQuery;
        }
    });
});
