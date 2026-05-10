const request = require('supertest');
const app = require('../../src/app');

describe('Game API Routes', () => {
  let agent;

  beforeEach(() => {
    agent = request.agent(app);
  });

  describe('GET /', () => {
    test('returns API info', async () => {
      const res = await agent.get('/');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Chess Engine API');
    });
  });

  describe('GET /health', () => {
    test('returns health status', async () => {
      const res = await agent.get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('POST /api/game', () => {
    test('creates a new game', async () => {
      const res = await agent.post('/api/game').send({});
      expect(res.status).toBe(201);
      expect(res.body.state.currentTurn).toBe('white');
      expect(res.body.state.status).toBe('active');
    });

    test('creates game with explicit 8x8', async () => {
      const res = await agent.post('/api/game').send({ rows: 8, cols: 8 });
      expect(res.status).toBe(201);
    });

    test('rejects non-8x8 board', async () => {
      const res = await agent.post('/api/game').send({ rows: 10, cols: 10 });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/game', () => {
    test('returns 404 without active game', async () => {
      const res = await agent.get('/api/game');
      expect(res.status).toBe(404);
    });

    test('returns game state', async () => {
      await agent.post('/api/game').send({});
      const res = await agent.get('/api/game');
      expect(res.status).toBe(200);
      expect(res.body.state).toBeDefined();
    });
  });

  describe('POST /api/game/move', () => {
    beforeEach(async () => {
      await agent.post('/api/game').send({});
    });

    test('makes a move with algebraic notation', async () => {
      const res = await agent.post('/api/game/move')
        .send({ from: 'e2', to: 'e4' });
      expect(res.status).toBe(200);
      expect(res.body.state.currentTurn).toBe('black');
    });

    test('makes a move with row/col', async () => {
      const res = await agent.post('/api/game/move')
        .send({ from: { row: 6, col: 4 }, to: { row: 4, col: 4 } });
      expect(res.status).toBe(200);
    });

    test('rejects invalid move', async () => {
      const res = await agent.post('/api/game/move')
        .send({ from: 'e2', to: 'e5' });
      expect(res.status).toBe(400);
    });

    test('rejects missing fields', async () => {
      const res = await agent.post('/api/game/move').send({});
      expect(res.status).toBe(400);
    });

    test('rejects invalid notation', async () => {
      const res = await agent.post('/api/game/move')
        .send({ from: 'z9', to: 'e4' });
      expect(res.status).toBe(400);
    });

    test('rejects without active game', async () => {
      const freshAgent = request.agent(app);
      const res = await freshAgent.post('/api/game/move')
        .send({ from: 'e2', to: 'e4' });
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/game/valid-moves', () => {
    beforeEach(async () => {
      await agent.post('/api/game').send({});
    });

    test('returns valid moves with position query', async () => {
      const res = await agent.get('/api/game/valid-moves?position=e2');
      expect(res.status).toBe(200);
      expect(res.body.validMoves).toContain('e3');
      expect(res.body.validMoves).toContain('e4');
    });

    test('returns valid moves with row/col query', async () => {
      const res = await agent.get('/api/game/valid-moves?row=6&col=4');
      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThan(0);
    });

    test('returns error for empty square', async () => {
      const res = await agent.get('/api/game/valid-moves?position=e4');
      expect(res.status).toBe(400);
    });

    test('returns error for invalid position', async () => {
      const res = await agent.get('/api/game/valid-moves?position=z9');
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/game', () => {
    test('resets the game', async () => {
      await agent.post('/api/game').send({});
      const res = await agent.delete('/api/game');
      expect(res.status).toBe(200);

      const getRes = await agent.get('/api/game');
      expect(getRes.status).toBe(404);
    });
  });
});
