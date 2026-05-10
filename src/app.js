const express = require('express');
const session = require('express-session');

const gameRoutes = require('./routes/gameRoutes');

const app = express();

// Middleware
app.use(express.json());

// Session configuration (in-memory, no database)
app.use(session({
  secret: process.env.SESSION_SECRET || 'chess-engine-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
  },
}));

// Routes
app.use('/api', gameRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Chess Engine API',
    version: '1.0.0',
    endpoints: {
      'POST /api/game': 'Create a new game (body: { rows?: 8, cols?: 8 })',
      'GET /api/game': 'Get current game state',
      'POST /api/game/move': 'Make a move (body: { from: "e2", to: "e4", promotion?: "queen" })',
      'GET /api/game/valid-moves': 'Get valid moves (query: ?position=e2)',
      'DELETE /api/game': 'Reset/delete current game',
    },
  });
});

module.exports = app;
