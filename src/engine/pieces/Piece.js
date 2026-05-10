/**
 * Base class for all chess pieces.
 * Each subclass must implement getType(), getSymbol(), and getPseudoLegalMoves().
 */
class Piece {
  /**
   * @param {string} color - 'white' or 'black'
   * @param {number} row - 0-indexed row position
   * @param {number} col - 0-indexed column position
   */
  constructor(color, row, col) {
    this.color = color;
    this.row = row;
    this.col = col;
    this.hasMoved = false;
  }

  /**
   * Returns the piece type string (e.g. 'king', 'queen').
   * @returns {string}
   */
  getType() {
    throw new Error('getType() must be implemented by subclass');
  }

  /**
   * Returns the Unicode symbol for this piece.
   * @returns {string}
   */
  getSymbol() {
    throw new Error('getSymbol() must be implemented by subclass');
  }

  /**
   * Returns all pseudo-legal moves (ignoring check constraints).
   * @param {Board} board - The current board state
   * @param {object|null} enPassantTarget - En passant target square { row, col } or null
   * @returns {Array<{row: number, col: number}>}
   */
  // eslint-disable-next-line no-unused-vars
  getPseudoLegalMoves(board, enPassantTarget) {
    throw new Error('getPseudoLegalMoves() must be implemented by subclass');
  }

  /**
   * Helper: generates moves along a direction until blocked.
   * Used by sliding pieces (Rook, Bishop, Queen).
   * @param {Board} board
   * @param {number} dRow - row direction (-1, 0, or 1)
   * @param {number} dCol - col direction (-1, 0, or 1)
   * @returns {Array<{row: number, col: number}>}
   */
  getSlidingMoves(board, dRow, dCol) {
    const moves = [];
    let r = this.row + dRow;
    let c = this.col + dCol;

    while (board.isInBounds(r, c)) {
      const target = board.getPiece(r, c);
      if (!target) {
        moves.push({ row: r, col: c });
      } else {
        if (target.color !== this.color) {
          moves.push({ row: r, col: c });
        }
        break;
      }
      r += dRow;
      c += dCol;
    }

    return moves;
  }

  /**
   * Serializes this piece to a plain object.
   * @returns {object}
   */
  serialize() {
    return {
      type: this.getType(),
      color: this.color,
      row: this.row,
      col: this.col,
      hasMoved: this.hasMoved,
    };
  }
}

module.exports = Piece;
