# Test Run: Black Wins (Fool's Mate)

This guide provides a sequence of API calls to simulate the shortest possible chess game where Black wins in just 2 moves (4 plies), known as Fool's Mate.

## Prerequisites

Ensure the API is running locally on port 3000. You will need `curl` and a file to store session cookies, as the engine relies on sessions.

---

## 1. Create a New Game

First, create a new game session.

```bash
curl -X POST http://localhost:3000/api/game \
  -b cookies.txt -c cookies.txt
```

---

## 2. Play the Moves

Execute the following move commands in order.

### Move 1
**White:** f3
```bash
curl -X POST http://localhost:3000/api/game/move \
  -H "Content-Type: application/json" -b cookies.txt -c cookies.txt \
  -d '{"from": "f2", "to": "f3"}'
```

**Black:** e5
```bash
curl -X POST http://localhost:3000/api/game/move \
  -H "Content-Type: application/json" -b cookies.txt -c cookies.txt \
  -d '{"from": "e7", "to": "e5"}'
```

### Move 2
**White:** g4
```bash
curl -X POST http://localhost:3000/api/game/move \
  -H "Content-Type: application/json" -b cookies.txt -c cookies.txt \
  -d '{"from": "g2", "to": "g4"}'
```

**Black:** Qh4# (Checkmate)
```bash
curl -X POST http://localhost:3000/api/game/move \
  -H "Content-Type: application/json" -b cookies.txt -c cookies.txt \
  -d '{"from": "d8", "to": "h4"}'
```

---

## 3. Verify Game State

Check the final state of the game.

```bash
curl -X GET http://localhost:3000/api/game \
  -b cookies.txt -c cookies.txt
```

The response should indicate `"status": "checkmate"` and `"winner": "black"`.
