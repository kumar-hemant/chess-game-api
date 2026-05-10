# ♟ Chess Engine API

A fully-featured two-player chess game engine built with **Node.js** and **Express**, deployable via **Docker**. The engine implements all standard chess rules including castling, en passant, pawn promotion, check, checkmate, and stalemate detection.

## Table of Contents

- [How to Run](#how-to-run)
- [API Reference](#api-reference)
- [Design Overview](#design-overview)
- [Assumptions](#assumptions)
- [Test Runs](#test-runs)
- [Testing](#testing)
- [Project Structure](#project-structure)

---

## How to Run

### Using Docker (Recommended)

```bash
# Build and run
docker-compose up --build

# The API will be available at http://localhost:3000
```

### Using Node.js Locally

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or with auto-reload for development
npm run dev
```

### Running Tests

```bash
# Run all tests with coverage
npm test

# Watch mode
npm run test:watch
```

### Linting

```bash
npm run lint
npm run lint:fix
```

---

## API Reference

### Base URL: `http://localhost:3000`

| Method   | Endpoint                | Description                    |
|----------|-------------------------|--------------------------------|
| `POST`   | `/api/game`             | Create a new game              |
| `GET`    | `/api/game`             | Get current game state         |
| `POST`   | `/api/game/move`        | Make a move                    |
| `GET`    | `/api/game/valid-moves` | Get valid moves for a piece    |
| `DELETE` | `/api/game`             | Reset/delete current game      |

### Create a New Game

```bash
curl -X POST http://localhost:3000/api/game \
  -H "Content-Type: application/json" \
  -b cookies.txt -c cookies.txt \
  -d '{"rows": 8, "cols": 8}'
```

### Make a Move (Algebraic Notation)

```bash
curl -X POST http://localhost:3000/api/game/move \
  -H "Content-Type: application/json" \
  -b cookies.txt -c cookies.txt \
  -d '{"from": "e2", "to": "e4"}'
```

### Make a Move (Row/Col Coordinates)

```bash
curl -X POST http://localhost:3000/api/game/move \
  -H "Content-Type: application/json" \
  -b cookies.txt -c cookies.txt \
  -d '{"from": {"row": 6, "col": 4}, "to": {"row": 4, "col": 4}}'
```

### Pawn Promotion

```bash
curl -X POST http://localhost:3000/api/game/move \
  -H "Content-Type: application/json" \
  -b cookies.txt -c cookies.txt \
  -d '{"from": "a7", "to": "a8", "promotion": "knight"}'
```

### Get Valid Moves

```bash
curl "http://localhost:3000/api/game/valid-moves?position=e2" \
  -b cookies.txt -c cookies.txt
```

---

## Test Runs

We have created 3 sample API test sequences that you can run locally to see the engine in action:

- [Game 1: White Wins (Scholar's Mate)](docs/game1_white_wins.md) - A 4-move checkmate by White.
- [Game 2: Black Wins (Fool's Mate)](docs/game2_black_wins.md) - A 2-move checkmate by Black.
- [Game 3: Stalemate (Tie)](docs/game3_stalemate.md) - Sam Loyd's famous 10-move stalemate.

### Automated Test Script

Alternatively, you can run all 3 scenarios automatically using the provided Node.js test script, which directly interacts with the game engine class to simulate the sequences:

```bash
node test-sequences.js
```

---

## Design Overview

### Architecture

```
┌─────────────────────────────────┐
│        Express API Layer        │
│   (Session-based game storage)  │
└──────────┬──────────────────────┘
           │
┌──────────▼──────────────────────┐
│         Game Controller         │
│  (Turn mgmt, move orchestration)│
└──────────┬──────────────────────┘
           │
┌──────────▼──────────────────────┐
│        MoveValidator            │
│  (Check/Checkmate/Stalemate)    │
└──────────┬──────────────────────┘
           │
┌──────────▼──────────────────────┐
│           Board                 │
│   (Grid state, piece tracking)  │
└──────────┬──────────────────────┘
           │
┌──────────▼──────────────────────┐
│      Piece Hierarchy            │
│  King|Queen|Rook|Bishop|Knight  │
│              Pawn               │
└─────────────────────────────────┘
```

### Key Components

| Component       | Responsibility                                                    |
|-----------------|-------------------------------------------------------------------|
| **Piece** (base)| Abstract base with `getSlidingMoves()` helper for rook/bishop/queen |
| **Board**       | 2D grid management, cloning for simulation, algebraic notation    |
| **MoveValidator**| Static methods for check, checkmate, stalemate, and legal move filtering |
| **Game**        | Orchestrates gameplay: turn management, special move execution, state transitions |
| **PieceFactory**| Creates/deserializes pieces for session reconstruction            |

### Move Validation Pipeline

1. **Boundary check** — Is the move within the board?
2. **Source validation** — Is there a piece at the source?
3. **Ownership check** — Does the piece belong to the current player?
4. **Pseudo-legal generation** — Each piece generates candidate moves based on its movement rules
5. **Check filtering** — Simulate each move on a cloned board; discard moves that leave the king in check
6. **Castling extras** — Verify king is not in check, doesn't pass through attacked squares
7. **Execution** — Apply the move, handle special cases (castling, en passant, promotion)
8. **Status update** — Check for check, checkmate, or stalemate

### Special Moves

- **Castling**: King pseudo-legal moves include 2-square horizontal moves when conditions (unmoved king/rook, clear path) are met. MoveValidator adds check-through-attack validation.
- **En Passant**: Game tracks the en passant target square after any pawn double-move. Pawn includes the target in its pseudo-legal moves.
- **Pawn Promotion**: Detected after move execution when a pawn reaches the opposite rank. Defaults to queen; configurable via API.

### Session Management

Games are stored in Express sessions using `express-session` with in-memory storage. Each game is serialized/deserialized via `Game.serialize()` and `Game.deserialize()` using a `PieceFactory` to reconstruct piece instances from plain objects.

---

## Assumptions

1. **Standard chess only** — Board dimensions must be 8×8. Non-standard dimensions are rejected with a clear error message.
2. **Two-player, same session** — Both players share a single session (e.g., same browser or same curl session with cookies).
3. **No persistence** — Game state exists only in server memory. Restarting the server clears all games.
4. **Default promotion** — If no promotion piece is specified, pawns promote to queen.
5. **Coordinate system** — Row 0 is rank 8 (Black's back rank), Row 7 is rank 1 (White's back rank). Column 0 is file 'a'.
6. **No draw by repetition/50-move rule** — Only checkmate and stalemate are implemented as game-ending conditions.
7. **White moves first** — Standard chess convention.

---

## Testing

The project has **123 tests** across 5 test suites with **95%+ code coverage**:

| Test Suite         | Tests | Coverage Area                                        |
|--------------------|-------|------------------------------------------------------|
| `pieces.test.js`   | 25    | Movement rules for all 6 piece types                 |
| `Board.test.js`    | 22    | Board init, operations, cloning, notation, serialization |
| `MoveValidator.test.js` | 17 | Check, checkmate, stalemate, castling, pins          |
| `Game.test.js`     | 22    | Full gameplay, special moves, serialization           |
| `gameRoutes.test.js` | 13  | API endpoints, session persistence, error handling    |

---

## Project Structure

```
tekion/
├── src/
│   ├── engine/
│   │   ├── pieces/
│   │   │   ├── Piece.js          # Base class with sliding move helper
│   │   │   ├── King.js           # King + castling candidates
│   │   │   ├── Queen.js          # Rook + Bishop combined
│   │   │   ├── Rook.js           # Horizontal/vertical sliding
│   │   │   ├── Bishop.js         # Diagonal sliding
│   │   │   ├── Knight.js         # L-shaped jumping
│   │   │   ├── Pawn.js           # Forward, capture, en passant
│   │   │   └── PieceFactory.js   # Create/deserialize pieces
│   │   ├── Board.js              # Board state management
│   │   ├── MoveValidator.js      # Check/checkmate/stalemate logic
│   │   └── Game.js               # Game controller
│   ├── routes/
│   │   └── gameRoutes.js         # REST API endpoints
│   ├── app.js                    # Express app configuration
│   └── server.js                 # Server entry point
├── tests/
│   ├── engine/                   # Engine unit tests
│   └── routes/                   # API integration tests
├── Dockerfile
├── docker-compose.yml
├── .eslintrc.json                # Airbnb style guide
├── package.json
└── README.md
```
