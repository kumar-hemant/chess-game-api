const Game = require('../../src/engine/Game');
const Pawn = require('../../src/engine/pieces/Pawn');

describe('Game', () => {
  describe('constructor', () => {
    test('creates a game with 8x8 board', () => {
      const game = new Game(8, 8);
      expect(game.currentTurn).toBe('white');
      expect(game.status).toBe('active');
    });

    test('defaults to 8x8', () => {
      const game = new Game();
      expect(game.board.rows).toBe(8);
    });

    test('rejects non-8x8', () => {
      expect(() => new Game(10, 10)).toThrow();
    });
  });

  describe('basic moves', () => {
    let game;
    beforeEach(() => { game = new Game(); });

    test('white pawn e2-e4', () => {
      const r = game.makeMove(6, 4, 4, 4);
      expect(r.success).toBe(true);
      expect(game.board.getPiece(4, 4).getType()).toBe('pawn');
      expect(game.currentTurn).toBe('black');
    });

    test('enforces turn order', () => {
      const r = game.makeMove(1, 4, 3, 4);
      expect(r.success).toBe(false);
    });

    test('alternating turns', () => {
      game.makeMove(6, 4, 4, 4);
      game.makeMove(1, 4, 3, 4);
      expect(game.currentTurn).toBe('white');
    });

    test('rejects empty square', () => {
      const r = game.makeMove(4, 4, 3, 4);
      expect(r.success).toBe(false);
    });

    test('rejects out of bounds', () => {
      const r = game.makeMove(6, 4, -1, 4);
      expect(r.success).toBe(false);
    });

    test('rejects illegal move', () => {
      const r = game.makeMove(6, 4, 3, 4);
      expect(r.success).toBe(false);
    });

    test('pawn capture', () => {
      game.makeMove(6, 4, 4, 4);
      game.makeMove(1, 3, 3, 3);
      const r = game.makeMove(4, 4, 3, 3);
      expect(r.success).toBe(true);
    });

    test('knight move', () => {
      const r = game.makeMove(7, 1, 5, 2);
      expect(r.success).toBe(true);
    });
  });

  describe('en passant', () => {
    let game;
    beforeEach(() => { game = new Game(); });

    test('sets en passant target', () => {
      game.makeMove(6, 4, 4, 4);
      expect(game.enPassantTarget).toEqual({ row: 5, col: 4 });
    });

    test('clears en passant target', () => {
      game.makeMove(6, 4, 4, 4);
      game.makeMove(1, 0, 2, 0);
      expect(game.enPassantTarget).toBeNull();
    });

    test('executes en passant', () => {
      game.makeMove(6, 4, 4, 4);
      game.makeMove(1, 0, 2, 0);
      game.makeMove(4, 4, 3, 4);
      game.makeMove(1, 3, 3, 3);
      const r = game.makeMove(3, 4, 2, 3);
      expect(r.success).toBe(true);
      expect(r.move.special).toBe('enPassant');
      expect(game.board.getPiece(3, 3)).toBeNull();
    });
  });

  describe('castling', () => {
    let game;
    beforeEach(() => { game = new Game(); });

    test('kingside castling', () => {
      game.board.removePiece(7, 5);
      game.board.removePiece(7, 6);
      const r = game.makeMove(7, 4, 7, 6);
      expect(r.success).toBe(true);
      expect(r.move.special).toBe('castleKingside');
      expect(game.board.getPiece(7, 6).getType()).toBe('king');
      expect(game.board.getPiece(7, 5).getType()).toBe('rook');
    });

    test('queenside castling', () => {
      game.board.removePiece(7, 1);
      game.board.removePiece(7, 2);
      game.board.removePiece(7, 3);
      const r = game.makeMove(7, 4, 7, 2);
      expect(r.success).toBe(true);
      expect(r.move.special).toBe('castleQueenside');
    });
  });

  describe('pawn promotion', () => {
    test('promotes to queen', () => {
      const game = new Game();
      game.board.removePiece(6, 0);
      game.board.removePiece(0, 0);
      const p = new Pawn('white', 1, 0);
      p.hasMoved = true;
      game.board.setPiece(1, 0, p);
      const r = game.makeMove(1, 0, 0, 0);
      expect(r.success).toBe(true);
      expect(game.board.getPiece(0, 0).getType()).toBe('queen');
    });

    test('promotes to knight', () => {
      const game = new Game();
      game.board.removePiece(6, 0);
      game.board.removePiece(0, 0);
      const p = new Pawn('white', 1, 0);
      p.hasMoved = true;
      game.board.setPiece(1, 0, p);
      const r = game.makeMove(1, 0, 0, 0, 'knight');
      expect(r.success).toBe(true);
      expect(game.board.getPiece(0, 0).getType()).toBe('knight');
    });
  });

  describe('checkmate', () => {
    test("Fool's mate", () => {
      const game = new Game();
      game.makeMove(6, 5, 4, 5);
      game.makeMove(1, 4, 3, 4);
      game.makeMove(6, 6, 4, 6);
      game.makeMove(0, 3, 4, 7);
      expect(game.status).toBe('checkmate');
      expect(game.winner).toBe('black');
    });

    test('rejects moves after checkmate', () => {
      const game = new Game();
      game.makeMove(6, 5, 4, 5);
      game.makeMove(1, 4, 3, 4);
      game.makeMove(6, 6, 4, 6);
      game.makeMove(0, 3, 4, 7);
      const r = game.makeMove(6, 0, 5, 0);
      expect(r.success).toBe(false);
    });
  });

  describe('getLegalMoves', () => {
    test('empty for wrong turn', () => {
      const game = new Game();
      expect(game.getLegalMoves(1, 4)).toHaveLength(0);
    });

    test('returns moves for current player', () => {
      const game = new Game();
      const moves = game.getLegalMoves(6, 4);
      expect(moves).toContainEqual({ row: 5, col: 4 });
      expect(moves).toContainEqual({ row: 4, col: 4 });
    });
  });

  describe('serialization', () => {
    test('roundtrip works', () => {
      const game = new Game();
      game.makeMove(6, 4, 4, 4);
      const restored = Game.deserialize(game.serialize());
      expect(restored.currentTurn).toBe('black');
      expect(restored.board.getPiece(4, 4).getType()).toBe('pawn');
    });

    test('deserialized game continues', () => {
      const game = new Game();
      game.makeMove(6, 4, 4, 4);
      const restored = Game.deserialize(game.serialize());
      const r = restored.makeMove(1, 4, 3, 4);
      expect(r.success).toBe(true);
    });
  });

  describe('getState', () => {
    test('returns complete state', () => {
      const game = new Game();
      const state = game.getState();
      expect(state.currentTurn).toBe('white');
      expect(state.board).toHaveLength(8);
      expect(state.boardText).toBeDefined();
    });
  });
});
