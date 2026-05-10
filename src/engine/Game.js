const Board = require('./Board');
const MoveValidator = require('./MoveValidator');
const PieceFactory = require('./pieces/PieceFactory');

/**
 * Main game controller. Manages turns, move execution, special moves,
 * and game state transitions.
 */
class Game {
  /**
   * @param {number} rows - Board rows (must be 8 for standard chess)
   * @param {number} cols - Board columns (must be 8 for standard chess)
   */
  constructor(rows = 8, cols = 8) {
    const validation = Board.validateDimensions(rows, cols);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    this.board = new Board(rows, cols);
    this.board.initializeStandardPosition();
    this.currentTurn = 'white';
    this.status = 'active'; // active, check, checkmate, stalemate
    this.winner = null;
    this.moveHistory = [];
    this.enPassantTarget = null;
    this.capturedPieces = { white: [], black: [] };
  }

  /**
   * Gets the opponent color.
   */
  static getOpponentColor(color) {
    return color === 'white' ? 'black' : 'white';
  }

  /**
   * Returns all legal moves for the piece at the given position.
   */
  getLegalMoves(row, col) {
    const piece = this.board.getPiece(row, col);
    if (!piece) return [];
    if (piece.color !== this.currentTurn) return [];

    return MoveValidator.getLegalMoves(this.board, row, col, this.enPassantTarget);
  }

  /**
   * Attempts to make a move. Returns a result object.
   * @param {number} fromRow
   * @param {number} fromCol
   * @param {number} toRow
   * @param {number} toCol
   * @param {string} [promotionType='queen'] - Piece type for pawn promotion
   * @returns {{ success: boolean, reason?: string, move?: object }}
   */
  makeMove(fromRow, fromCol, toRow, toCol, promotionType = 'queen') {
    // Validate game is still active
    if (this.status === 'checkmate' || this.status === 'stalemate') {
      return { success: false, reason: `Game is over: ${this.status}` };
    }

    // Validate coordinates are in bounds
    if (!this.board.isInBounds(fromRow, fromCol) || !this.board.isInBounds(toRow, toCol)) {
      return { success: false, reason: 'Move is out of board boundaries' };
    }

    // Validate source has a piece
    const piece = this.board.getPiece(fromRow, fromCol);
    if (!piece) {
      return { success: false, reason: 'No piece at source position' };
    }

    // Validate piece belongs to current player
    if (piece.color !== this.currentTurn) {
      return { success: false, reason: `It is ${this.currentTurn}'s turn` };
    }

    // Validate the move is legal
    const legalMoves = MoveValidator.getLegalMoves(
      this.board,
      fromRow,
      fromCol,
      this.enPassantTarget,
    );
    const isLegal = legalMoves.some((m) => m.row === toRow && m.col === toCol);
    if (!isLegal) {
      return { success: false, reason: 'Invalid move for this piece' };
    }

    // Validate promotion type
    const validPromotions = ['queen', 'rook', 'bishop', 'knight'];
    if (!validPromotions.includes(promotionType)) {
      return { success: false, reason: `Invalid promotion type: ${promotionType}` };
    }

    // Execute the move
    const moveRecord = this.executeMove(fromRow, fromCol, toRow, toCol, promotionType);

    // Switch turns
    this.currentTurn = Game.getOpponentColor(this.currentTurn);

    // Update game status
    this.updateGameStatus();

    return { success: true, move: moveRecord };
  }

  /**
   * Executes a validated move on the board. Handles special moves.
   * @private
   */
  executeMove(fromRow, fromCol, toRow, toCol, promotionType) {
    const piece = this.board.getPiece(fromRow, fromCol);
    const captured = this.board.getPiece(toRow, toCol);
    const moveRecord = {
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece: piece.serialize(),
      captured: captured ? captured.serialize() : null,
      notation: this.buildNotation(fromRow, fromCol, toRow, toCol),
      special: null,
    };

    // Detect and handle special moves
    if (piece.getType() === 'king' && Math.abs(toCol - fromCol) === 2) {
      this.executeCastling(fromRow, fromCol, toCol);
      moveRecord.special = toCol > fromCol ? 'castleKingside' : 'castleQueenside';
    } else if (
      piece.getType() === 'pawn'
      && this.enPassantTarget
      && toRow === this.enPassantTarget.row
      && toCol === this.enPassantTarget.col
    ) {
      this.executeEnPassant(fromRow, fromCol, toRow, toCol);
      moveRecord.special = 'enPassant';
      moveRecord.captured = this.board.getPiece(fromRow, toCol)
        ? this.board.getPiece(fromRow, toCol).serialize()
        : { type: 'pawn', color: Game.getOpponentColor(piece.color) };
      // The pawn was already removed in executeEnPassant, record it
    } else {
      // Normal move
      if (captured) {
        this.capturedPieces[captured.color].push(captured.serialize());
      }
      this.board.removePiece(fromRow, fromCol);
      this.board.setPiece(toRow, toCol, piece);
      piece.hasMoved = true;
    }

    // Update en passant target
    this.updateEnPassantTarget(piece, fromRow, toRow, toCol);

    // Handle pawn promotion
    if (piece.getType() === 'pawn') {
      const promotionRow = piece.color === 'white' ? 0 : this.board.rows - 1;
      if (toRow === promotionRow) {
        this.executePromotion(toRow, toCol, piece.color, promotionType);
        moveRecord.special = 'promotion';
        moveRecord.promotedTo = promotionType;
      }
    }

    this.moveHistory.push(moveRecord);
    return moveRecord;
  }

  /**
   * Executes castling by moving both king and rook.
   * @private
   */
  executeCastling(row, kingCol, targetCol) {
    const king = this.board.getPiece(row, kingCol);

    if (targetCol === 6) {
      // Kingside
      const rook = this.board.getPiece(row, 7);
      this.board.removePiece(row, kingCol);
      this.board.removePiece(row, 7);
      this.board.setPiece(row, 6, king);
      this.board.setPiece(row, 5, rook);
      king.hasMoved = true;
      rook.hasMoved = true;
    } else {
      // Queenside
      const rook = this.board.getPiece(row, 0);
      this.board.removePiece(row, kingCol);
      this.board.removePiece(row, 0);
      this.board.setPiece(row, 2, king);
      this.board.setPiece(row, 3, rook);
      king.hasMoved = true;
      rook.hasMoved = true;
    }
  }

  /**
   * Executes en passant capture.
   * @private
   */
  executeEnPassant(fromRow, fromCol, toRow, toCol) {
    const piece = this.board.getPiece(fromRow, fromCol);
    const capturedPawn = this.board.getPiece(fromRow, toCol);

    if (capturedPawn) {
      this.capturedPieces[capturedPawn.color].push(capturedPawn.serialize());
    }

    this.board.removePiece(fromRow, toCol); // Remove captured pawn
    this.board.removePiece(fromRow, fromCol);
    this.board.setPiece(toRow, toCol, piece);
    piece.hasMoved = true;
  }

  /**
   * Executes pawn promotion by replacing the pawn with the chosen piece.
   * @private
   */
  executePromotion(row, col, color, promotionType) {
    const promoted = PieceFactory.create(promotionType, color, row, col);
    promoted.hasMoved = true;
    this.board.setPiece(row, col, promoted);
  }

  /**
   * Updates the en passant target after a pawn double-move.
   * @private
   */
  updateEnPassantTarget(piece, fromRow, toRow, toCol) {
    if (piece.getType() === 'pawn' && Math.abs(toRow - fromRow) === 2) {
      // En passant target is the square the pawn passed through
      const targetRow = (fromRow + toRow) / 2;
      this.enPassantTarget = { row: targetRow, col: toCol };
    } else {
      this.enPassantTarget = null;
    }
  }

  /**
   * Updates game status (check, checkmate, stalemate) after a move.
   * @private
   */
  updateGameStatus() {
    const inCheck = MoveValidator.isInCheck(this.board, this.currentTurn);
    const hasLegal = MoveValidator.hasLegalMoves(
      this.board,
      this.currentTurn,
      this.enPassantTarget,
    );

    if (inCheck && !hasLegal) {
      this.status = 'checkmate';
      this.winner = Game.getOpponentColor(this.currentTurn);
    } else if (!inCheck && !hasLegal) {
      this.status = 'stalemate';
      this.winner = null;
    } else if (inCheck) {
      this.status = 'check';
    } else {
      this.status = 'active';
    }
  }

  /**
   * Builds a simple move notation string.
   * @private
   */
  buildNotation(fromRow, fromCol, toRow, toCol) {
    const from = Board.toAlgebraic(fromRow, fromCol);
    const to = Board.toAlgebraic(toRow, toCol);
    return `${from}${to}`;
  }

  /**
   * Returns the full game state as a plain object.
   */
  getState() {
    return {
      board: this.getBoardDisplay(),
      currentTurn: this.currentTurn,
      status: this.status,
      winner: this.winner,
      moveHistory: this.moveHistory.map((m) => ({
        from: Board.toAlgebraic(m.from.row, m.from.col),
        to: Board.toAlgebraic(m.to.row, m.to.col),
        piece: m.piece.type,
        captured: m.captured ? m.captured.type : null,
        special: m.special,
        promotedTo: m.promotedTo || null,
      })),
      capturedPieces: this.capturedPieces,
      enPassantTarget: this.enPassantTarget
        ? Board.toAlgebraic(this.enPassantTarget.row, this.enPassantTarget.col)
        : null,
      boardText: this.board.toString(),
    };
  }

  /**
   * Returns the board as a 2D array of piece info objects.
   * @private
   */
  getBoardDisplay() {
    const display = [];
    for (let r = 0; r < this.board.rows; r++) {
      const row = [];
      for (let c = 0; c < this.board.cols; c++) {
        const piece = this.board.getPiece(r, c);
        if (piece) {
          row.push({
            type: piece.getType(),
            color: piece.color,
            symbol: piece.getSymbol(),
            position: Board.toAlgebraic(r, c),
          });
        } else {
          row.push(null);
        }
      }
      display.push(row);
    }
    return display;
  }

  /**
   * Serializes the game to a plain object for session storage.
   */
  serialize() {
    return {
      board: this.board.serialize(),
      currentTurn: this.currentTurn,
      status: this.status,
      winner: this.winner,
      moveHistory: this.moveHistory,
      enPassantTarget: this.enPassantTarget,
      capturedPieces: this.capturedPieces,
    };
  }

  /**
   * Deserializes a game from plain object data.
   * @param {object} data
   * @returns {Game}
   */
  static deserialize(data) {
    const game = Object.create(Game.prototype);
    game.board = Board.deserialize(data.board);
    game.currentTurn = data.currentTurn;
    game.status = data.status;
    game.winner = data.winner;
    game.moveHistory = data.moveHistory || [];
    game.enPassantTarget = data.enPassantTarget || null;
    game.capturedPieces = data.capturedPieces || { white: [], black: [] };
    return game;
  }
}

module.exports = Game;
