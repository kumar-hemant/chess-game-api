const Piece = require('./Piece');

class Queen extends Piece {
  getType() {
    return 'queen';
  }

  getSymbol() {
    return this.color === 'white' ? '♕' : '♛';
  }

  getPseudoLegalMoves(board) {
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];

    return directions.flatMap(([dRow, dCol]) => this.getSlidingMoves(board, dRow, dCol));
  }
}

module.exports = Queen;
