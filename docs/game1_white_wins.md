# Test Run: White Wins (Scholar's Mate)

This guide provides a sequence of API calls to simulate a complete game where White wins in just 4 moves (7 plies) using the famous Scholar's Mate.

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
**White:** e4
```bash
curl -X POST http://localhost:3000/api/game/move \
  -H "Content-Type: application/json" -b cookies.txt -c cookies.txt \
  -d '{"from": "e2", "to": "e4"}'
```

**Black:** e5
```bash
curl -X POST http://localhost:3000/api/game/move \
  -H "Content-Type: application/json" -b cookies.txt -c cookies.txt \
  -d '{"from": "e7", "to": "e5"}'
```

### Move 2
**White:** Qh5
```bash
curl -X POST http://localhost:3000/api/game/move \
  -H "Content-Type: application/json" -b cookies.txt -c cookies.txt \
  -d '{"from": "d1", "to": "h5"}'
```

**Black:** Nc6
```bash
curl -X POST http://localhost:3000/api/game/move \
  -H "Content-Type: application/json" -b cookies.txt -c cookies.txt \
  -d '{"from": "b8", "to": "c6"}'
```

### Move 3
**White:** Bc4
```bash
curl -X POST http://localhost:3000/api/game/move \
  -H "Content-Type: application/json" -b cookies.txt -c cookies.txt \
  -d '{"from": "f1", "to": "c4"}'
```

**Black:** Nf6
```bash
curl -X POST http://localhost:3000/api/game/move \
  -H "Content-Type: application/json" -b cookies.txt -c cookies.txt \
  -d '{"from": "g8", "to": "f6"}'
```

### Move 4 (Checkmate)
**White:** Qxf7#
```bash
curl -X POST http://localhost:3000/api/game/move \
  -H "Content-Type: application/json" -b cookies.txt -c cookies.txt \
  -d '{"from": "h5", "to": "f7"}'
```

---

## 3. Verify Game State

Check the final state of the game.

```bash
curl -X GET http://localhost:3000/api/game \
  -b cookies.txt -c cookies.txt
```

The response should indicate `"status": "checkmate"` and `"winner": "white"`.
