const Piece = require('./Piece');

class Bishop extends Piece {
  getType() {
    return 'bishop';
  }

  getSymbol() {
    return this.color === 'white' ? '♗' : '♝';
  }

  getPseudoLegalMoves(board) {
    const directions = [
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];

    return directions.flatMap(([dRow, dCol]) => this.getSlidingMoves(board, dRow, dCol));
  }
}

module.exports = Bishop;
