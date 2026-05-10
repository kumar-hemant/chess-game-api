const Piece = require('./Piece');

class Pawn extends Piece {
  getType() {
    return 'pawn';
  }

  getSymbol() {
    return this.color === 'white' ? '♙' : '♟';
  }

  /**
   * Returns the direction this pawn moves: -1 for white (up), +1 for black (down).
   */
  getDirection() {
    return this.color === 'white' ? -1 : 1;
  }

  /**
   * Returns the starting row for this pawn's color.
   */
  getStartRow(boardRows) {
    return this.color === 'white' ? boardRows - 2 : 1;
  }

  /**
   * Returns the promotion row for this pawn's color.
   */
  getPromotionRow() {
    return this.color === 'white' ? 0 : 7;
  }

  getPseudoLegalMoves(board, enPassantTarget) {
    const moves = [];
    const dir = this.getDirection();
    const { row, col } = this;
    const forwardRow = row + dir;

    // Forward one square
    if (board.isInBounds(forwardRow, col) && !board.getPiece(forwardRow, col)) {
      moves.push({ row: forwardRow, col });

      // Forward two squares from starting position
      const startRow = this.getStartRow(board.rows);
      const doubleRow = row + 2 * dir;
      if (
        row === startRow
        && board.isInBounds(doubleRow, col)
        && !board.getPiece(doubleRow, col)
      ) {
        moves.push({ row: doubleRow, col });
      }
    }

    // Diagonal captures
    for (const dc of [-1, 1]) {
      const captureCol = col + dc;
      if (board.isInBounds(forwardRow, captureCol)) {
        const target = board.getPiece(forwardRow, captureCol);
        if (target && target.color !== this.color) {
          moves.push({ row: forwardRow, col: captureCol });
        }

        // En passant
        if (
          enPassantTarget
          && enPassantTarget.row === forwardRow
          && enPassantTarget.col === captureCol
        ) {
          moves.push({ row: forwardRow, col: captureCol });
        }
      }
    }

    return moves;
  }
}

module.exports = Pawn;
