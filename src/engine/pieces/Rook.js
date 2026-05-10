const Piece = require('./Piece');

class Rook extends Piece {
  getType() {
    return 'rook';
  }

  getSymbol() {
    return this.color === 'white' ? '♖' : '♜';
  }

  getPseudoLegalMoves(board) {
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
    ];

    return directions.flatMap(([dRow, dCol]) => this.getSlidingMoves(board, dRow, dCol));
  }
}

module.exports = Rook;
