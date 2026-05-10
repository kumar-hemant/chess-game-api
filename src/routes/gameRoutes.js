const express = require('express');
const Game = require('../engine/Game');
const Board = require('../engine/Board');

const router = express.Router();

/**
 * Helper: gets or reconstructs the Game instance from session data.
 */
function getGameFromSession(session) {
  if (!session.game) return null;
  return Game.deserialize(session.game);
}

/**
 * Helper: saves the Game instance to session.
 */
function saveGameToSession(session, game) {
  // eslint-disable-next-line no-param-reassign
  session.game = game.serialize();
}

/**
 * POST /api/game
 * Creates a new chess game.
 * Body: { rows?: number, cols?: number }
 */
router.post('/game', (req, res) => {
  const { rows = 8, cols = 8 } = req.body;

  const validation = Board.validateDimensions(rows, cols);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.reason });
  }

  try {
    const game = new Game(rows, cols);
    saveGameToSession(req.session, game);

    return res.status(201).json({
      message: 'New chess game created',
      state: game.getState(),
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/game
 * Gets the current game state.
 */
router.get('/game', (req, res) => {
  const game = getGameFromSession(req.session);
  if (!game) {
    return res.status(404).json({ error: 'No active game. Create one with POST /api/game' });
  }

  return res.json({ state: game.getState() });
});

/**
 * POST /api/game/move
 * Makes a move in the current game.
 * Body: { from: "e2" | { row, col }, to: "e4" | { row, col }, promotion?: string }
 */
router.post('/game/move', (req, res) => {
  const game = getGameFromSession(req.session);
  if (!game) {
    return res.status(404).json({ error: 'No active game. Create one with POST /api/game' });
  }

  const { from, to, promotion = 'queen' } = req.body;
  if (!from || !to) {
    return res.status(400).json({ error: 'Both "from" and "to" positions are required' });
  }

  // Parse positions (support both algebraic notation and {row, col})
  let fromPos;
  let toPos;

  if (typeof from === 'string') {
    fromPos = Board.fromAlgebraic(from);
    if (!fromPos) {
      return res.status(400).json({ error: `Invalid "from" notation: ${from}` });
    }
  } else {
    fromPos = { row: from.row, col: from.col };
  }

  if (typeof to === 'string') {
    toPos = Board.fromAlgebraic(to);
    if (!toPos) {
      return res.status(400).json({ error: `Invalid "to" notation: ${to}` });
    }
  } else {
    toPos = { row: to.row, col: to.col };
  }

  const result = game.makeMove(fromPos.row, fromPos.col, toPos.row, toPos.col, promotion);

  if (!result.success) {
    return res.status(400).json({ error: result.reason });
  }

  saveGameToSession(req.session, game);

  return res.json({
    message: 'Move executed successfully',
    move: {
      from: Board.toAlgebraic(fromPos.row, fromPos.col),
      to: Board.toAlgebraic(toPos.row, toPos.col),
      special: result.move.special,
      promotedTo: result.move.promotedTo || null,
    },
    state: game.getState(),
  });
});

/**
 * GET /api/game/valid-moves
 * Gets valid moves for a piece at the given position.
 * Query: ?position=e2 or ?row=6&col=4
 */
router.get('/game/valid-moves', (req, res) => {
  const game = getGameFromSession(req.session);
  if (!game) {
    return res.status(404).json({ error: 'No active game. Create one with POST /api/game' });
  }

  let { row, col } = req.query;
  const { position } = req.query;

  if (position) {
    const pos = Board.fromAlgebraic(position);
    if (!pos) {
      return res.status(400).json({ error: `Invalid position: ${position}` });
    }
    ({ row, col } = pos);
  } else {
    row = parseInt(row, 10);
    col = parseInt(col, 10);
  }

  if (Number.isNaN(row) || Number.isNaN(col)) {
    return res.status(400).json({ error: 'Position is required (e.g., ?position=e2 or ?row=6&col=4)' });
  }

  const piece = game.board.getPiece(row, col);
  if (!piece) {
    return res.status(400).json({ error: 'No piece at the specified position' });
  }

  const moves = game.getLegalMoves(row, col);
  const algebraicMoves = moves.map((m) => Board.toAlgebraic(m.row, m.col));

  return res.json({
    piece: {
      type: piece.getType(),
      color: piece.color,
      position: Board.toAlgebraic(row, col),
    },
    validMoves: algebraicMoves,
    count: moves.length,
  });
});

/**
 * DELETE /api/game
 * Resets/deletes the current game.
 */
router.delete('/game', (req, res) => {
  req.session.game = null;
  return res.json({ message: 'Game has been reset' });
});

module.exports = router;
