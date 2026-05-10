const Piece = require('./Piece');

class Knight extends Piece {
  getType() {
    return 'knight';
  }

  getSymbol() {
    return this.color === 'white' ? '♘' : '♞';
  }

  getPseudoLegalMoves(board) {
    const moves = [];
    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];

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

    return moves;
  }
}

module.exports = Knight;
