/**
 * Handles move validation including check, checkmate, and stalemate detection.
 */
class MoveValidator {
  /**
   * Checks whether the given color's king is currently in check.
   * @param {Board} board
   * @param {string} color - The color whose king we're checking
   * @returns {boolean}
   */
  static isInCheck(board, color) {
    const kingPos = board.findKing(color);
    if (!kingPos) return false;

    const opponentColor = color === 'white' ? 'black' : 'white';
    const opponentPieces = board.getPiecesByColor(opponentColor);

    for (const piece of opponentPieces) {
      const moves = piece.getPseudoLegalMoves(board, null);
      for (const move of moves) {
        if (move.row === kingPos.row && move.col === kingPos.col) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Checks whether a square is attacked by any piece of the given color.
   * @param {Board} board
   * @param {number} row
   * @param {number} col
   * @param {string} attackerColor
   * @returns {boolean}
   */
  static isSquareAttacked(board, row, col, attackerColor) {
    const pieces = board.getPiecesByColor(attackerColor);
    for (const piece of pieces) {
      const moves = piece.getPseudoLegalMoves(board, null);
      for (const move of moves) {
        if (move.row === row && move.col === col) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Simulates a move on a cloned board and checks if it leaves the
   * moving player's king in check.
   * @param {Board} board
   * @param {number} fromRow
   * @param {number} fromCol
   * @param {number} toRow
   * @param {number} toCol
   * @param {object|null} enPassantTarget
   * @returns {boolean} true if the move leaves the king in check (i.e. illegal)
   */
  static wouldLeaveKingInCheck(board, fromRow, fromCol, toRow, toCol, enPassantTarget) {
    const piece = board.getPiece(fromRow, fromCol);
    if (!piece) return true;

    const cloned = board.clone();
    const clonedPiece = cloned.getPiece(fromRow, fromCol);

    // Handle en passant capture on cloned board
    if (
      clonedPiece.getType() === 'pawn'
      && enPassantTarget
      && toRow === enPassantTarget.row
      && toCol === enPassantTarget.col
    ) {
      // Remove the captured pawn (it's on the same row as the moving pawn, at the target col)
      cloned.removePiece(fromRow, toCol);
    }

    // Execute the move on cloned board
    cloned.removePiece(fromRow, fromCol);
    cloned.setPiece(toRow, toCol, clonedPiece);

    return MoveValidator.isInCheck(cloned, piece.color);
  }

  /**
   * Returns all legal moves for a piece at the given position.
   * Filters pseudo-legal moves by removing those that leave king in check.
   * Also validates castling through/into check.
   * @param {Board} board
   * @param {number} row
   * @param {number} col
   * @param {object|null} enPassantTarget
   * @returns {Array<{row: number, col: number}>}
   */
  static getLegalMoves(board, row, col, enPassantTarget) {
    const piece = board.getPiece(row, col);
    if (!piece) return [];

    const pseudoLegal = piece.getPseudoLegalMoves(board, enPassantTarget);
    const legalMoves = [];

    for (const move of pseudoLegal) {
      // Special castling validation
      if (piece.getType() === 'king' && Math.abs(move.col - col) === 2) {
        if (!MoveValidator.isCastlingLegal(board, piece, move.col)) {
          continue;
        }
      }

      // Check that the move doesn't leave king in check
      if (!MoveValidator.wouldLeaveKingInCheck(
        board,
        row,
        col,
        move.row,
        move.col,
        enPassantTarget,
      )) {
        legalMoves.push(move);
      }
    }

    return legalMoves;
  }

  /**
   * Validates castling-specific rules:
   * - King is not currently in check
   * - King does not pass through check
   * - King does not end up in check (handled by wouldLeaveKingInCheck)
   * @param {Board} board
   * @param {Piece} king
   * @param {number} targetCol - Destination column (2 for queenside, 6 for kingside)
   * @returns {boolean}
   */
  static isCastlingLegal(board, king, targetCol) {
    const opponentColor = king.color === 'white' ? 'black' : 'white';

    // King must not be in check
    if (MoveValidator.isInCheck(board, king.color)) {
      return false;
    }

    // King must not pass through attacked squares
    const direction = targetCol > king.col ? 1 : -1;
    const passThroughCol = king.col + direction;

    if (MoveValidator.isSquareAttacked(board, king.row, passThroughCol, opponentColor)) {
      return false;
    }

    // Destination square attack check is handled by wouldLeaveKingInCheck
    return true;
  }

  /**
   * Checks if the given color has any legal moves.
   * @param {Board} board
   * @param {string} color
   * @param {object|null} enPassantTarget
   * @returns {boolean}
   */
  static hasLegalMoves(board, color, enPassantTarget) {
    const pieces = board.getPiecesByColor(color);
    for (const piece of pieces) {
      const moves = MoveValidator.getLegalMoves(
        board,
        piece.row,
        piece.col,
        enPassantTarget,
      );
      if (moves.length > 0) return true;
    }
    return false;
  }

  /**
   * Checks if the given color is in checkmate.
   * Checkmate = in check + no legal moves.
   * @param {Board} board
   * @param {string} color
   * @param {object|null} enPassantTarget
   * @returns {boolean}
   */
  static isCheckmate(board, color, enPassantTarget) {
    return (
      MoveValidator.isInCheck(board, color)
      && !MoveValidator.hasLegalMoves(board, color, enPassantTarget)
    );
  }

  /**
   * Checks if the given color is in stalemate.
   * Stalemate = not in check + no legal moves.
   * @param {Board} board
   * @param {string} color
   * @param {object|null} enPassantTarget
   * @returns {boolean}
   */
  static isStalemate(board, color, enPassantTarget) {
    return (
      !MoveValidator.isInCheck(board, color)
      && !MoveValidator.hasLegalMoves(board, color, enPassantTarget)
    );
  }
}

module.exports = MoveValidator;
