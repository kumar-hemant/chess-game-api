const Board = require('../../src/engine/Board');
const King = require('../../src/engine/pieces/King');
const Pawn = require('../../src/engine/pieces/Pawn');
const PieceFactory = require('../../src/engine/pieces/PieceFactory');

describe('Board', () => {
  describe('constructor', () => {
    test('creates a board with correct dimensions', () => {
      const board = new Board(8, 8);
      expect(board.rows).toBe(8);
      expect(board.cols).toBe(8);
    });

    test('initializes all cells as null', () => {
      const board = new Board(8, 8);
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          expect(board.getPiece(r, c)).toBeNull();
        }
      }
    });
  });

  describe('validateDimensions', () => {
    test('accepts 8x8 board', () => {
      expect(Board.validateDimensions(8, 8)).toEqual({ valid: true });
    });

    test('rejects non-8x8 boards', () => {
      const result = Board.validateDimensions(10, 10);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('8x8');
    });

    test('rejects non-integer dimensions', () => {
      const result = Board.validateDimensions(8.5, 8);
      expect(result.valid).toBe(false);
    });

    test('rejects negative dimensions', () => {
      const result = Board.validateDimensions(-1, 8);
      expect(result.valid).toBe(false);
    });
  });

  describe('initializeStandardPosition', () => {
    let board;

    beforeEach(() => {
      board = new Board(8, 8);
      board.initializeStandardPosition();
    });

    test('places white pieces on rows 6-7', () => {
      // White pawns on row 6
      for (let c = 0; c < 8; c++) {
        const piece = board.getPiece(6, c);
        expect(piece).not.toBeNull();
        expect(piece.color).toBe('white');
        expect(piece.getType()).toBe('pawn');
      }

      // White back rank
      expect(board.getPiece(7, 0).getType()).toBe('rook');
      expect(board.getPiece(7, 1).getType()).toBe('knight');
      expect(board.getPiece(7, 2).getType()).toBe('bishop');
      expect(board.getPiece(7, 3).getType()).toBe('queen');
      expect(board.getPiece(7, 4).getType()).toBe('king');
      expect(board.getPiece(7, 5).getType()).toBe('bishop');
      expect(board.getPiece(7, 6).getType()).toBe('knight');
      expect(board.getPiece(7, 7).getType()).toBe('rook');
    });

    test('places black pieces on rows 0-1', () => {
      // Black pawns on row 1
      for (let c = 0; c < 8; c++) {
        const piece = board.getPiece(1, c);
        expect(piece.color).toBe('black');
        expect(piece.getType()).toBe('pawn');
      }

      // Black back rank
      expect(board.getPiece(0, 0).getType()).toBe('rook');
      expect(board.getPiece(0, 4).getType()).toBe('king');
    });

    test('middle rows are empty', () => {
      for (let r = 2; r < 6; r++) {
        for (let c = 0; c < 8; c++) {
          expect(board.getPiece(r, c)).toBeNull();
        }
      }
    });

    test('has 32 total pieces', () => {
      let count = 0;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (board.getPiece(r, c)) count++;
        }
      }
      expect(count).toBe(32);
    });
  });

  describe('isInBounds', () => {
    const board = new Board(8, 8);

    test('returns true for valid positions', () => {
      expect(board.isInBounds(0, 0)).toBe(true);
      expect(board.isInBounds(7, 7)).toBe(true);
      expect(board.isInBounds(4, 4)).toBe(true);
    });

    test('returns false for out-of-bounds positions', () => {
      expect(board.isInBounds(-1, 0)).toBe(false);
      expect(board.isInBounds(0, -1)).toBe(false);
      expect(board.isInBounds(8, 0)).toBe(false);
      expect(board.isInBounds(0, 8)).toBe(false);
    });
  });

  describe('piece operations', () => {
    test('setPiece and getPiece work correctly', () => {
      const board = new Board(8, 8);
      const pawn = new Pawn('white', 6, 4);
      board.setPiece(6, 4, pawn);
      expect(board.getPiece(6, 4)).toBe(pawn);
    });

    test('removePiece removes and returns the piece', () => {
      const board = new Board(8, 8);
      const pawn = new Pawn('white', 6, 4);
      board.setPiece(6, 4, pawn);
      const removed = board.removePiece(6, 4);
      expect(removed).toBe(pawn);
      expect(board.getPiece(6, 4)).toBeNull();
    });

    test('setPiece updates piece coordinates', () => {
      const board = new Board(8, 8);
      const pawn = new Pawn('white', 6, 4);
      board.setPiece(5, 4, pawn);
      expect(pawn.row).toBe(5);
      expect(pawn.col).toBe(4);
    });
  });

  describe('findKing', () => {
    test('finds the white king', () => {
      const board = new Board(8, 8);
      board.initializeStandardPosition();
      const pos = board.findKing('white');
      expect(pos).toEqual({ row: 7, col: 4 });
    });

    test('finds the black king', () => {
      const board = new Board(8, 8);
      board.initializeStandardPosition();
      const pos = board.findKing('black');
      expect(pos).toEqual({ row: 0, col: 4 });
    });

    test('returns null if king not found', () => {
      const board = new Board(8, 8);
      expect(board.findKing('white')).toBeNull();
    });
  });

  describe('clone', () => {
    test('creates an independent copy', () => {
      const board = new Board(8, 8);
      board.initializeStandardPosition();
      const clone = board.clone();

      // Modify clone
      clone.removePiece(6, 4);

      // Original should be unaffected
      expect(board.getPiece(6, 4)).not.toBeNull();
      expect(clone.getPiece(6, 4)).toBeNull();
    });

    test('preserves hasMoved state', () => {
      const board = new Board(8, 8);
      const king = new King('white', 7, 4);
      king.hasMoved = true;
      board.setPiece(7, 4, king);

      const clone = board.clone();
      expect(clone.getPiece(7, 4).hasMoved).toBe(true);
    });
  });

  describe('algebraic notation', () => {
    test('toAlgebraic converts correctly', () => {
      expect(Board.toAlgebraic(7, 0)).toBe('a1');
      expect(Board.toAlgebraic(0, 0)).toBe('a8');
      expect(Board.toAlgebraic(6, 4)).toBe('e2');
      expect(Board.toAlgebraic(0, 7)).toBe('h8');
    });

    test('fromAlgebraic converts correctly', () => {
      expect(Board.fromAlgebraic('a1')).toEqual({ row: 7, col: 0 });
      expect(Board.fromAlgebraic('e2')).toEqual({ row: 6, col: 4 });
      expect(Board.fromAlgebraic('h8')).toEqual({ row: 0, col: 7 });
    });

    test('fromAlgebraic returns null for invalid input', () => {
      expect(Board.fromAlgebraic('')).toBeNull();
      expect(Board.fromAlgebraic('z9')).toBeNull();
      expect(Board.fromAlgebraic(null)).toBeNull();
    });
  });

  describe('serialization', () => {
    test('serialize and deserialize roundtrip', () => {
      const board = new Board(8, 8);
      board.initializeStandardPosition();

      const data = board.serialize();
      const restored = Board.deserialize(data);

      expect(restored.rows).toBe(8);
      expect(restored.cols).toBe(8);
      expect(restored.getPiece(7, 4).getType()).toBe('king');
      expect(restored.getPiece(7, 4).color).toBe('white');
      expect(restored.getPiece(6, 0).getType()).toBe('pawn');
    });
  });

  describe('toString', () => {
    test('renders the board', () => {
      const board = new Board(8, 8);
      board.initializeStandardPosition();
      const str = board.toString();
      expect(str).toContain('a b c d e f g h');
      expect(str).toContain('♔');
      expect(str).toContain('♚');
    });
  });
});

describe('PieceFactory', () => {
  test('creates piece from data', () => {
    const piece = PieceFactory.fromData({
      type: 'queen', color: 'white', row: 3, col: 3, hasMoved: true,
    });
    expect(piece.getType()).toBe('queen');
    expect(piece.color).toBe('white');
    expect(piece.hasMoved).toBe(true);
  });

  test('creates piece by type', () => {
    const piece = PieceFactory.create('knight', 'black', 0, 1);
    expect(piece.getType()).toBe('knight');
    expect(piece.color).toBe('black');
  });

  test('throws for unknown type', () => {
    expect(() => PieceFactory.fromData({ type: 'dragon' })).toThrow('Unknown piece type');
    expect(() => PieceFactory.create('dragon', 'white', 0, 0)).toThrow('Unknown piece type');
  });
});
