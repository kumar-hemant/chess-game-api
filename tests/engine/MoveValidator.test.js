const Board = require('../../src/engine/Board');
const MoveValidator = require('../../src/engine/MoveValidator');
const King = require('../../src/engine/pieces/King');
const Queen = require('../../src/engine/pieces/Queen');
const Rook = require('../../src/engine/pieces/Rook');
const Bishop = require('../../src/engine/pieces/Bishop');
const Knight = require('../../src/engine/pieces/Knight');
const Pawn = require('../../src/engine/pieces/Pawn');

describe('MoveValidator', () => {
  describe('isInCheck', () => {
    test('detects check from rook', () => {
      const board = new Board(8, 8);
      board.setPiece(0, 0, new King('white', 0, 0));
      board.setPiece(0, 7, new Rook('black', 0, 7));
      expect(MoveValidator.isInCheck(board, 'white')).toBe(true);
    });

    test('detects check from bishop', () => {
      const board = new Board(8, 8);
      board.setPiece(4, 4, new King('white', 4, 4));
      board.setPiece(2, 2, new Bishop('black', 2, 2));
      expect(MoveValidator.isInCheck(board, 'white')).toBe(true);
    });

    test('detects check from knight', () => {
      const board = new Board(8, 8);
      board.setPiece(4, 4, new King('white', 4, 4));
      board.setPiece(2, 3, new Knight('black', 2, 3));
      expect(MoveValidator.isInCheck(board, 'white')).toBe(true);
    });

    test('detects check from pawn', () => {
      const board = new Board(8, 8);
      board.setPiece(4, 4, new King('white', 4, 4));
      board.setPiece(3, 3, new Pawn('black', 3, 3));
      expect(MoveValidator.isInCheck(board, 'white')).toBe(true);
    });

    test('returns false when not in check', () => {
      const board = new Board(8, 8);
      board.initializeStandardPosition();
      expect(MoveValidator.isInCheck(board, 'white')).toBe(false);
      expect(MoveValidator.isInCheck(board, 'black')).toBe(false);
    });

    test('blocked check is not check', () => {
      const board = new Board(8, 8);
      board.setPiece(0, 0, new King('white', 0, 0));
      board.setPiece(0, 1, new Pawn('white', 0, 1)); // blocks rook
      board.setPiece(0, 7, new Rook('black', 0, 7));
      expect(MoveValidator.isInCheck(board, 'white')).toBe(false);
    });
  });

  describe('isSquareAttacked', () => {
    test('detects attacked square', () => {
      const board = new Board(8, 8);
      board.setPiece(7, 0, new Rook('black', 7, 0));
      expect(MoveValidator.isSquareAttacked(board, 7, 4, 'black')).toBe(true);
    });

    test('detects safe square', () => {
      const board = new Board(8, 8);
      board.setPiece(0, 0, new Rook('black', 0, 0));
      expect(MoveValidator.isSquareAttacked(board, 4, 4, 'black')).toBe(false);
    });
  });

  describe('wouldLeaveKingInCheck', () => {
    test('prevents moving pinned piece', () => {
      const board = new Board(8, 8);
      // King at (7,4), Rook pinning through bishop at (7,5)
      board.setPiece(7, 4, new King('white', 7, 4));
      board.setPiece(7, 5, new Bishop('white', 7, 5)); // pinned
      board.setPiece(7, 7, new Rook('black', 7, 7));

      // Moving bishop away would expose king
      expect(MoveValidator.wouldLeaveKingInCheck(board, 7, 5, 6, 4, null)).toBe(true);
    });

    test('allows non-pinned piece to move', () => {
      const board = new Board(8, 8);
      board.setPiece(7, 4, new King('white', 7, 4));
      board.setPiece(5, 3, new Knight('white', 5, 3));
      board.setPiece(0, 0, new King('black', 0, 0));

      expect(MoveValidator.wouldLeaveKingInCheck(board, 5, 3, 3, 2, null)).toBe(false);
    });
  });

  describe('getLegalMoves', () => {
    test('filters out moves that leave king in check', () => {
      const board = new Board(8, 8);
      board.setPiece(7, 4, new King('white', 7, 4));
      board.setPiece(7, 5, new Bishop('white', 7, 5));
      board.setPiece(7, 7, new Rook('black', 7, 7));
      board.setPiece(0, 0, new King('black', 0, 0));

      const moves = MoveValidator.getLegalMoves(board, 7, 5, null);
      // Bishop is pinned, can only move along the pin line or capture the rook
      // Pin is horizontal, bishop moves diagonally → no legal moves
      expect(moves).toHaveLength(0);
    });

    test('king cannot move into check', () => {
      const board = new Board(8, 8);
      board.setPiece(4, 4, new King('white', 4, 4));
      board.setPiece(0, 5, new Rook('black', 0, 5));
      board.setPiece(0, 0, new King('black', 0, 0));

      const moves = MoveValidator.getLegalMoves(board, 4, 4, null);
      // King should not be able to move to column 5 (attacked by rook)
      const col5Moves = moves.filter((m) => m.col === 5);
      expect(col5Moves).toHaveLength(0);
    });
  });

  describe('castling validation', () => {
    test('disallows castling when king is in check', () => {
      const board = new Board(8, 8);
      const king = new King('white', 7, 4);
      board.setPiece(7, 4, king);
      board.setPiece(7, 7, new Rook('white', 7, 7));
      board.setPiece(0, 4, new Rook('black', 0, 4)); // checking the king
      board.setPiece(0, 0, new King('black', 0, 0));

      const moves = MoveValidator.getLegalMoves(board, 7, 4, null);
      expect(moves).not.toContainEqual({ row: 7, col: 6 });
    });

    test('disallows castling through attacked square', () => {
      const board = new Board(8, 8);
      const king = new King('white', 7, 4);
      board.setPiece(7, 4, king);
      board.setPiece(7, 7, new Rook('white', 7, 7));
      board.setPiece(0, 5, new Rook('black', 0, 5)); // attacks f1 (7,5)
      board.setPiece(0, 0, new King('black', 0, 0));

      const moves = MoveValidator.getLegalMoves(board, 7, 4, null);
      expect(moves).not.toContainEqual({ row: 7, col: 6 });
    });

    test('allows castling when path is safe', () => {
      const board = new Board(8, 8);
      const king = new King('white', 7, 4);
      board.setPiece(7, 4, king);
      board.setPiece(7, 7, new Rook('white', 7, 7));
      board.setPiece(0, 0, new King('black', 0, 0));

      const moves = MoveValidator.getLegalMoves(board, 7, 4, null);
      expect(moves).toContainEqual({ row: 7, col: 6 });
    });
  });

  describe('checkmate detection', () => {
    test('detects back rank checkmate', () => {
      const board = new Board(8, 8);
      // Classic back rank mate
      board.setPiece(7, 7, new King('white', 7, 7));
      board.setPiece(6, 6, new Pawn('white', 6, 6));
      board.setPiece(6, 7, new Pawn('white', 6, 7));
      board.setPiece(0, 0, new Rook('black', 0, 0));
      board.setPiece(7, 0, new Rook('black', 7, 0)); // delivers checkmate
      board.setPiece(0, 4, new King('black', 0, 4));

      expect(MoveValidator.isCheckmate(board, 'white', null)).toBe(true);
    });

    test('not checkmate if king can escape', () => {
      const board = new Board(8, 8);
      board.setPiece(7, 7, new King('white', 7, 7));
      board.setPiece(7, 0, new Rook('black', 7, 0)); // check
      board.setPiece(0, 4, new King('black', 0, 4));

      expect(MoveValidator.isCheckmate(board, 'white', null)).toBe(false);
    });

    test('not checkmate if check can be blocked', () => {
      const board = new Board(8, 8);
      board.setPiece(7, 4, new King('white', 7, 4));
      board.setPiece(6, 4, new Pawn('white', 6, 4));
      board.setPiece(6, 3, new Pawn('white', 6, 3));
      board.setPiece(6, 5, new Pawn('white', 6, 5));
      board.setPiece(5, 2, new Rook('white', 5, 2)); // can block
      board.setPiece(0, 4, new Rook('black', 0, 4)); // checking
      board.setPiece(0, 0, new King('black', 0, 0));

      expect(MoveValidator.isCheckmate(board, 'white', null)).toBe(false);
    });
  });

  describe('stalemate detection', () => {
    test('detects stalemate', () => {
      const board = new Board(8, 8);
      // Classic stalemate: king cornered with no legal moves but not in check
      board.setPiece(0, 0, new King('black', 0, 0));
      board.setPiece(1, 2, new Queen('white', 1, 2));
      board.setPiece(2, 1, new King('white', 2, 1));

      expect(MoveValidator.isStalemate(board, 'black', null)).toBe(true);
    });

    test('not stalemate if in check', () => {
      const board = new Board(8, 8);
      board.setPiece(0, 0, new King('black', 0, 0));
      board.setPiece(0, 7, new Rook('white', 0, 7)); // checking
      board.setPiece(7, 7, new King('white', 7, 7));

      expect(MoveValidator.isStalemate(board, 'black', null)).toBe(false);
    });

    test('not stalemate if has legal moves', () => {
      const board = new Board(8, 8);
      board.initializeStandardPosition();
      expect(MoveValidator.isStalemate(board, 'white', null)).toBe(false);
    });
  });
});
