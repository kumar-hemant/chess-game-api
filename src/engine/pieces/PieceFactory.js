const King = require('./King');
const Queen = require('./Queen');
const Rook = require('./Rook');
const Bishop = require('./Bishop');
const Knight = require('./Knight');
const Pawn = require('./Pawn');

const PIECE_MAP = {
  king: King,
  queen: Queen,
  rook: Rook,
  bishop: Bishop,
  knight: Knight,
  pawn: Pawn,
};

/**
 * Factory for creating and deserializing chess pieces.
 */
class PieceFactory {
  /**
   * Creates a piece instance from a serialized plain object.
   * Used to reconstruct game state from session data.
   * @param {object} data - Serialized piece data
   * @returns {Piece}
   */
  static fromData(data) {
    const PieceClass = PIECE_MAP[data.type];
    if (!PieceClass) {
      throw new Error(`Unknown piece type: ${data.type}`);
    }
    const piece = new PieceClass(data.color, data.row, data.col);
    piece.hasMoved = data.hasMoved || false;
    return piece;
  }

  /**
   * Creates a new piece by type.
   * @param {string} type - Piece type string
   * @param {string} color - 'white' or 'black'
   * @param {number} row
   * @param {number} col
   * @returns {Piece}
   */
  static create(type, color, row, col) {
    const PieceClass = PIECE_MAP[type];
    if (!PieceClass) {
      throw new Error(`Unknown piece type: ${type}`);
    }
    return new PieceClass(color, row, col);
  }
}

module.exports = PieceFactory;
