const Game = require('./src/engine/Game');
const Board = require('./src/engine/Board');

function testGame(name, moves, expectedStatus, expectedWinner) {
  console.log(`\n--- Testing ${name} ---`);
  const game = new Game();
  
  for (const notation of moves) {
    // Basic parser for Standard Algebraic Notation to simple from-to
    // The makeMove expects from, to in simple algebraic like "e2", "e4"
    const [from, to] = notation;
    const fromPos = Board.fromAlgebraic(from);
    const toPos = Board.fromAlgebraic(to);
    const result = game.makeMove(fromPos.row, fromPos.col, toPos.row, toPos.col);
    if (!result.success) {
      console.error(`Move failed: ${from}-${to} -> ${result.reason}`);
      return false;
    }
  }
  
  const state = game.getState();
  if (state.status !== expectedStatus) {
    console.error(`Expected status ${expectedStatus}, but got ${state.status}`);
    return false;
  }
  
  if (expectedWinner !== undefined && state.winner !== expectedWinner) {
    console.error(`Expected winner ${expectedWinner}, but got ${state.winner}`);
    return false;
  }
  
  console.log(`Success! Game ended in ${state.status} with winner: ${state.winner}`);
  return true;
}

const game1Moves = [
  ['e2', 'e4'], ['e7', 'e5'],
  ['d1', 'h5'], ['b8', 'c6'],
  ['f1', 'c4'], ['g8', 'f6'],
  ['h5', 'f7'] // Scholar's Mate
];

const game2Moves = [
  ['f2', 'f3'], ['e7', 'e5'],
  ['g2', 'g4'], ['d8', 'h4'] // Fool's Mate
];

const game3Moves = [
  // Sam Loyd's 10-move stalemate
  ['e2', 'e3'], ['a7', 'a5'],
  ['d1', 'h5'], ['a8', 'a6'],
  ['h5', 'a5'], ['h7', 'h5'],
  ['h2', 'h4'], ['a6', 'h6'],
  ['a5', 'c7'], ['f7', 'f6'],
  ['c7', 'd7'], ['e8', 'f7'],
  ['d7', 'b7'], ['d8', 'd3'],
  ['b7', 'b8'], ['d3', 'h7'],
  ['b8', 'c8'], ['f7', 'g6'],
  ['c8', 'e6']
];

let allPassed = true;
allPassed &= testGame("Game 1 (White Wins - Scholar's Mate)", game1Moves, 'checkmate', 'white');
allPassed &= testGame("Game 2 (Black Wins - Fool's Mate)", game2Moves, 'checkmate', 'black');
allPassed &= testGame("Game 3 (Stalemate - Tie)", game3Moves, 'stalemate', null);

if (allPassed) {
  console.log("\nAll simulations passed successfully!");
} else {
  console.log("\nSome simulations failed.");
}
