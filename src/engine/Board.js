const King = require('./pieces/King');
const Queen = require('./pieces/Queen');
const Rook = require('./pieces/Rook');
const Bishop = require('./pieces/Bishop');
const Knight = require('./pieces/Knight');
const Pawn = require('./pieces/Pawn');
const PieceFactory = require('./pieces/PieceFactory');

/**
 * Represents the chess board and manages piece positions.
 */
class Board {
  /**
   * @param {number} rows - Number of rows
   * @param {number} cols - Number of columns
   */
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  }

  /**
   * Validates that the given dimensions support standard chess.
   * @param {number} rows
   * @param {number} cols
   * @returns {{ valid: boolean, reason?: string }}
   */
  static validateDimensions(rows, cols) {
    if (!Number.isInteger(rows) || !Number.isInteger(cols)) {
      return { valid: false, reason: 'Board dimensions must be integers' };
    }
    if (rows < 1 || cols < 1) {
      return { valid: false, reason: 'Board dimensions must be positive' };
    }
    if (rows !== 8 || cols !== 8) {
      return {
        valid: false,
        reason: 'Standard chess requires an 8x8 board. '
          + `Provided dimensions ${rows}x${cols} are not compatible.`,
      };
    }
    return { valid: true };
  }

  /**
   * Initializes the board with standard chess starting position.
   * @throws {Error} If board is not 8x8
   */
  initializeStandardPosition() {
    const validation = Board.validateDimensions(this.rows, this.cols);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    // Black back rank (row 0)
    this.grid[0][0] = new Rook('black', 0, 0);
    this.grid[0][1] = new Knight('black', 0, 1);
    this.grid[0][2] = new Bishop('black', 0, 2);
    this.grid[0][3] = new Queen('black', 0, 3);
    this.grid[0][4] = new King('black', 0, 4);
    this.grid[0][5] = new Bishop('black', 0, 5);
    this.grid[0][6] = new Knight('black', 0, 6);
    this.grid[0][7] = new Rook('black', 0, 7);

    // Black pawns (row 1)
    for (let c = 0; c < 8; c++) {
      this.grid[1][c] = new Pawn('black', 1, c);
    }

    // White pawns (row 6)
    for (let c = 0; c < 8; c++) {
      this.grid[6][c] = new Pawn('white', 6, c);
    }

    // White back rank (row 7)
    this.grid[7][0] = new Rook('white', 7, 0);
    this.grid[7][1] = new Knight('white', 7, 1);
    this.grid[7][2] = new Bishop('white', 7, 2);
    this.grid[7][3] = new Queen('white', 7, 3);
    this.grid[7][4] = new King('white', 7, 4);
    this.grid[7][5] = new Bishop('white', 7, 5);
    this.grid[7][6] = new Knight('white', 7, 6);
    this.grid[7][7] = new Rook('white', 7, 7);
  }

  /**
   * Checks if coordinates are within board boundaries.
   */
  isInBounds(row, col) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  /**
   * Gets the piece at the given position.
   * @returns {Piece|null}
   */
  getPiece(row, col) {
    if (!this.isInBounds(row, col)) return null;
    return this.grid[row][col];
  }

  /**
   * Places a piece at the given position, updating the piece's coordinates.
   */
  setPiece(row, col, piece) {
    this.grid[row][col] = piece;
    if (piece) {
      /* eslint-disable no-param-reassign */
      piece.row = row;
      piece.col = col;
      /* eslint-enable no-param-reassign */
    }
  }

  /**
   * Removes and returns the piece at the given position.
   * @returns {Piece|null}
   */
  removePiece(row, col) {
    const piece = this.grid[row][col];
    this.grid[row][col] = null;
    return piece;
  }

  /**
   * Finds the king's position for a given color.
   * @param {string} color
   * @returns {{ row: number, col: number }|null}
   */
  findKing(color) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const piece = this.grid[r][c];
        if (piece && piece.getType() === 'king' && piece.color === color) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  }

  /**
   * Returns all pieces of the given color.
   * @param {string} color
   * @returns {Array<Piece>}
   */
  getPiecesByColor(color) {
    const pieces = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const piece = this.grid[r][c];
        if (piece && piece.color === color) {
          pieces.push(piece);
        }
      }
    }
    return pieces;
  }

  /**
   * Creates a deep copy of this board for move simulation.
   * @returns {Board}
   */
  clone() {
    const copy = new Board(this.rows, this.cols);
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const piece = this.grid[r][c];
        if (piece) {
          const cloned = PieceFactory.create(piece.getType(), piece.color, r, c);
          cloned.hasMoved = piece.hasMoved;
          copy.grid[r][c] = cloned;
        }
      }
    }
    return copy;
  }

  /**
   * Serializes the board to a plain object for session storage.
   */
  serialize() {
    const grid = this.grid.map((row) => row.map((piece) => (piece ? piece.serialize() : null)));
    return { rows: this.rows, cols: this.cols, grid };
  }

  /**
   * Deserializes a board from plain object data.
   * @param {object} data
   * @returns {Board}
   */
  static deserialize(data) {
    const board = new Board(data.rows, data.cols);
    for (let r = 0; r < data.rows; r++) {
      for (let c = 0; c < data.cols; c++) {
        const pieceData = data.grid[r][c];
        if (pieceData) {
          board.grid[r][c] = PieceFactory.fromData(pieceData);
        }
      }
    }
    return board;
  }

  /**
   * Converts board position to algebraic notation (e.g., {row:6, col:4} → "e2").
   */
  static toAlgebraic(row, col) {
    const file = String.fromCharCode(97 + col); // a-h
    const rank = 8 - row; // 1-8
    return `${file}${rank}`;
  }

  /**
   * Converts algebraic notation to board position (e.g., "e2" → {row:6, col:4}).
   */
  static fromAlgebraic(notation) {
    if (!notation || notation.length !== 2) return null;
    const col = notation.charCodeAt(0) - 97;
    const row = 8 - parseInt(notation[1], 10);
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;
    return { row, col };
  }

  /**
   * Returns a text representation of the board for console display.
   */
  toString() {
    const lines = [];
    lines.push('  a b c d e f g h');
    for (let r = 0; r < this.rows; r++) {
      const rank = 8 - r;
      const row = this.grid[r].map((piece) => (piece ? piece.getSymbol() : '.')).join(' ');
      lines.push(`${rank} ${row} ${rank}`);
    }
    lines.push('  a b c d e f g h');
    return lines.join('\n');
  }
}

module.exports = Board;
