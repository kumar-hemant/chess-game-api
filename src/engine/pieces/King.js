const Piece = require('./Piece');

class King extends Piece {
  getType() {
    return 'king';
  }

  getSymbol() {
    return this.color === 'white' ? '♔' : '♚';
  }

  getPseudoLegalMoves(board) {
    const moves = [];
    const offsets = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1],
    ];

    // Normal king moves
    for (const [dRow, dCol] of offsets) {
      const r = this.row + dRow;
      const c = this.col + dCol;
      if (board.isInBounds(r, c)) {
        const target = board.getPiece(r, c);
        if (!target || target.color !== this.color) {
          moves.push({ row: r, col: c });
        }
      }
    }

    // Castling (pseudo-legal: only checks pieces, not attacks)
    if (!this.hasMoved) {
      // Kingside castling
      const kingsideRook = board.getPiece(this.row, 7);
      if (
        kingsideRook
        && kingsideRook.getType() === 'rook'
        && kingsideRook.color === this.color
        && !kingsideRook.hasMoved
        && !board.getPiece(this.row, 5)
        && !board.getPiece(this.row, 6)
      ) {
        moves.push({ row: this.row, col: 6 });
      }

      // Queenside castling
      const queensideRook = board.getPiece(this.row, 0);
      if (
        queensideRook
        && queensideRook.getType() === 'rook'
        && queensideRook.color === this.color
        && !queensideRook.hasMoved
        && !board.getPiece(this.row, 1)
        && !board.getPiece(this.row, 2)
        && !board.getPiece(this.row, 3)
      ) {
        moves.push({ row: this.row, col: 2 });
      }
    }

    return moves;
  }
}

module.exports = King;
