const Board = require('../../src/engine/Board');
const Pawn = require('../../src/engine/pieces/Pawn');
const Rook = require('../../src/engine/pieces/Rook');
const Knight = require('../../src/engine/pieces/Knight');
const Bishop = require('../../src/engine/pieces/Bishop');
const Queen = require('../../src/engine/pieces/Queen');
const King = require('../../src/engine/pieces/King');

describe('Pawn', () => {
  let board;

  beforeEach(() => {
    board = new Board(8, 8);
  });

  describe('White Pawn', () => {
    test('moves forward one square from starting position', () => {
      const pawn = new Pawn('white', 6, 4);
      board.setPiece(6, 4, pawn);
      const moves = pawn.getPseudoLegalMoves(board, null);
      expect(moves).toContainEqual({ row: 5, col: 4 });
    });

    test('moves forward two squares from starting position', () => {
      const pawn = new Pawn('white', 6, 4);
      board.setPiece(6, 4, pawn);
      const moves = pawn.getPseudoLegalMoves(board, null);
      expect(moves).toContainEqual({ row: 4, col: 4 });
    });

    test('cannot move forward two squares if not on starting row', () => {
      const pawn = new Pawn('white', 5, 4);
      board.setPiece(5, 4, pawn);
      const moves = pawn.getPseudoLegalMoves(board, null);
      expect(moves).not.toContainEqual({ row: 3, col: 4 });
    });

    test('cannot move forward if blocked', () => {
      const pawn = new Pawn('white', 6, 4);
      board.setPiece(6, 4, pawn);
      board.setPiece(5, 4, new Pawn('black', 5, 4));
      const moves = pawn.getPseudoLegalMoves(board, null);
      expect(moves).toHaveLength(0);
    });

    test('cannot move two squares if second square blocked', () => {
      const pawn = new Pawn('white', 6, 4);
      board.setPiece(6, 4, pawn);
      board.setPiece(4, 4, new Pawn('black', 4, 4));
      const moves = pawn.getPseudoLegalMoves(board, null);
      expect(moves).toContainEqual({ row: 5, col: 4 });
      expect(moves).not.toContainEqual({ row: 4, col: 4 });
    });

    test('captures diagonally', () => {
      const pawn = new Pawn('white', 4, 4);
      board.setPiece(4, 4, pawn);
      board.setPiece(3, 3, new Pawn('black', 3, 3));
      board.setPiece(3, 5, new Pawn('black', 3, 5));
      const moves = pawn.getPseudoLegalMoves(board, null);
      expect(moves).toContainEqual({ row: 3, col: 3 });
      expect(moves).toContainEqual({ row: 3, col: 5 });
    });

    test('cannot capture own pieces', () => {
      const pawn = new Pawn('white', 4, 4);
      board.setPiece(4, 4, pawn);
      board.setPiece(3, 3, new Pawn('white', 3, 3));
      const moves = pawn.getPseudoLegalMoves(board, null);
      expect(moves).not.toContainEqual({ row: 3, col: 3 });
    });

    test('en passant capture', () => {
      const pawn = new Pawn('white', 3, 4);
      board.setPiece(3, 4, pawn);
      board.setPiece(3, 5, new Pawn('black', 3, 5));
      const enPassantTarget = { row: 2, col: 5 };
      const moves = pawn.getPseudoLegalMoves(board, enPassantTarget);
      expect(moves).toContainEqual({ row: 2, col: 5 });
    });
  });

  describe('Black Pawn', () => {
    test('moves forward (downward) one square', () => {
      const pawn = new Pawn('black', 1, 4);
      board.setPiece(1, 4, pawn);
      const moves = pawn.getPseudoLegalMoves(board, null);
      expect(moves).toContainEqual({ row: 2, col: 4 });
    });

    test('moves forward two squares from starting position', () => {
      const pawn = new Pawn('black', 1, 4);
      board.setPiece(1, 4, pawn);
      const moves = pawn.getPseudoLegalMoves(board, null);
      expect(moves).toContainEqual({ row: 3, col: 4 });
    });

    test('en passant capture', () => {
      const pawn = new Pawn('black', 4, 3);
      board.setPiece(4, 3, pawn);
      board.setPiece(4, 4, new Pawn('white', 4, 4));
      const enPassantTarget = { row: 5, col: 4 };
      const moves = pawn.getPseudoLegalMoves(board, enPassantTarget);
      expect(moves).toContainEqual({ row: 5, col: 4 });
    });
  });
});

describe('Rook', () => {
  let board;

  beforeEach(() => {
    board = new Board(8, 8);
  });

  test('moves horizontally and vertically on empty board', () => {
    const rook = new Rook('white', 4, 4);
    board.setPiece(4, 4, rook);
    const moves = rook.getPseudoLegalMoves(board);
    // 7 horizontal + 7 vertical = 14
    expect(moves).toHaveLength(14);
  });

  test('is blocked by own pieces', () => {
    const rook = new Rook('white', 7, 0);
    board.setPiece(7, 0, rook);
    board.setPiece(7, 2, new Pawn('white', 7, 2));
    board.setPiece(5, 0, new Pawn('white', 5, 0));
    const moves = rook.getPseudoLegalMoves(board);
    // Right: (7,1) only; Up: (6,0) only; Down: none; Left: none
    expect(moves).toContainEqual({ row: 7, col: 1 });
    expect(moves).toContainEqual({ row: 6, col: 0 });
    expect(moves).not.toContainEqual({ row: 7, col: 2 });
    expect(moves).not.toContainEqual({ row: 5, col: 0 });
  });

  test('can capture enemy pieces but not pass through', () => {
    const rook = new Rook('white', 4, 4);
    board.setPiece(4, 4, rook);
    board.setPiece(4, 6, new Pawn('black', 4, 6));
    const moves = rook.getPseudoLegalMoves(board);
    expect(moves).toContainEqual({ row: 4, col: 6 }); // Can capture
    expect(moves).not.toContainEqual({ row: 4, col: 7 }); // Can't pass through
  });
});

describe('Knight', () => {
  let board;

  beforeEach(() => {
    board = new Board(8, 8);
  });

  test('has 8 moves from center of board', () => {
    const knight = new Knight('white', 4, 4);
    board.setPiece(4, 4, knight);
    const moves = knight.getPseudoLegalMoves(board);
    expect(moves).toHaveLength(8);
  });

  test('has 2 moves from corner', () => {
    const knight = new Knight('white', 0, 0);
    board.setPiece(0, 0, knight);
    const moves = knight.getPseudoLegalMoves(board);
    expect(moves).toHaveLength(2);
    expect(moves).toContainEqual({ row: 1, col: 2 });
    expect(moves).toContainEqual({ row: 2, col: 1 });
  });

  test('can jump over pieces', () => {
    const knight = new Knight('white', 7, 1);
    board.setPiece(7, 1, knight);
    // Surround with pieces
    board.setPiece(6, 0, new Pawn('white', 6, 0));
    board.setPiece(6, 1, new Pawn('white', 6, 1));
    board.setPiece(6, 2, new Pawn('white', 6, 2));
    const moves = knight.getPseudoLegalMoves(board);
    expect(moves.length).toBeGreaterThan(0);
    expect(moves).toContainEqual({ row: 5, col: 0 });
    expect(moves).toContainEqual({ row: 5, col: 2 });
  });

  test('cannot capture own pieces', () => {
    const knight = new Knight('white', 4, 4);
    board.setPiece(4, 4, knight);
    board.setPiece(2, 3, new Pawn('white', 2, 3));
    const moves = knight.getPseudoLegalMoves(board);
    expect(moves).not.toContainEqual({ row: 2, col: 3 });
  });

  test('can capture enemy pieces', () => {
    const knight = new Knight('white', 4, 4);
    board.setPiece(4, 4, knight);
    board.setPiece(2, 3, new Pawn('black', 2, 3));
    const moves = knight.getPseudoLegalMoves(board);
    expect(moves).toContainEqual({ row: 2, col: 3 });
  });
});

describe('Bishop', () => {
  let board;

  beforeEach(() => {
    board = new Board(8, 8);
  });

  test('moves diagonally on empty board', () => {
    const bishop = new Bishop('white', 4, 4);
    board.setPiece(4, 4, bishop);
    const moves = bishop.getPseudoLegalMoves(board);
    // From (4,4): 4 directions, various lengths
    expect(moves).toHaveLength(13);
  });

  test('is blocked by own pieces', () => {
    const bishop = new Bishop('white', 7, 2);
    board.setPiece(7, 2, bishop);
    board.setPiece(6, 3, new Pawn('white', 6, 3));
    board.setPiece(6, 1, new Pawn('white', 6, 1));
    const moves = bishop.getPseudoLegalMoves(board);
    expect(moves).toHaveLength(0);
  });

  test('can capture enemy pieces', () => {
    const bishop = new Bishop('white', 4, 4);
    board.setPiece(4, 4, bishop);
    board.setPiece(2, 2, new Pawn('black', 2, 2));
    const moves = bishop.getPseudoLegalMoves(board);
    expect(moves).toContainEqual({ row: 2, col: 2 });
    expect(moves).not.toContainEqual({ row: 1, col: 1 }); // blocked after capture
  });
});

describe('Queen', () => {
  let board;

  beforeEach(() => {
    board = new Board(8, 8);
  });

  test('moves like rook and bishop combined', () => {
    const queen = new Queen('white', 4, 4);
    board.setPiece(4, 4, queen);
    const moves = queen.getPseudoLegalMoves(board);
    // 14 (rook) + 13 (bishop) = 27
    expect(moves).toHaveLength(27);
  });
});

describe('King', () => {
  let board;

  beforeEach(() => {
    board = new Board(8, 8);
  });

  test('moves one square in any direction', () => {
    const king = new King('white', 4, 4);
    board.setPiece(4, 4, king);
    king.hasMoved = true; // prevent castling candidates
    const moves = king.getPseudoLegalMoves(board);
    expect(moves).toHaveLength(8);
  });

  test('has fewer moves in corner', () => {
    const king = new King('white', 0, 0);
    board.setPiece(0, 0, king);
    king.hasMoved = true;
    const moves = king.getPseudoLegalMoves(board);
    expect(moves).toHaveLength(3);
  });

  test('cannot capture own pieces', () => {
    const king = new King('white', 4, 4);
    board.setPiece(4, 4, king);
    king.hasMoved = true;
    board.setPiece(3, 4, new Pawn('white', 3, 4));
    const moves = king.getPseudoLegalMoves(board);
    expect(moves).not.toContainEqual({ row: 3, col: 4 });
  });

  test('includes kingside castling when conditions met', () => {
    const king = new King('white', 7, 4);
    board.setPiece(7, 4, king);
    const rook = new Rook('white', 7, 7);
    board.setPiece(7, 7, rook);
    const moves = king.getPseudoLegalMoves(board);
    expect(moves).toContainEqual({ row: 7, col: 6 });
  });

  test('includes queenside castling when conditions met', () => {
    const king = new King('white', 7, 4);
    board.setPiece(7, 4, king);
    const rook = new Rook('white', 7, 0);
    board.setPiece(7, 0, rook);
    const moves = king.getPseudoLegalMoves(board);
    expect(moves).toContainEqual({ row: 7, col: 2 });
  });

  test('no castling if king has moved', () => {
    const king = new King('white', 7, 4);
    king.hasMoved = true;
    board.setPiece(7, 4, king);
    board.setPiece(7, 7, new Rook('white', 7, 7));
    const moves = king.getPseudoLegalMoves(board);
    expect(moves).not.toContainEqual({ row: 7, col: 6 });
  });

  test('no castling if rook has moved', () => {
    const king = new King('white', 7, 4);
    board.setPiece(7, 4, king);
    const rook = new Rook('white', 7, 7);
    rook.hasMoved = true;
    board.setPiece(7, 7, rook);
    const moves = king.getPseudoLegalMoves(board);
    expect(moves).not.toContainEqual({ row: 7, col: 6 });
  });

  test('no castling if pieces between', () => {
    const king = new King('white', 7, 4);
    board.setPiece(7, 4, king);
    board.setPiece(7, 7, new Rook('white', 7, 7));
    board.setPiece(7, 5, new Bishop('white', 7, 5));
    const moves = king.getPseudoLegalMoves(board);
    expect(moves).not.toContainEqual({ row: 7, col: 6 });
  });
});
