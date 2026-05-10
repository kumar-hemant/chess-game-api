# Test Run: Stalemate (Tie)

This guide provides a sequence of API calls to simulate the fastest known stalemate in chess, constructed by Sam Loyd. The game ends in a tie after 10 moves (19 plies).

## Prerequisites

Ensure the API is running locally on port 3000. You will need `curl` and a file to store session cookies.

---

## 1. Create a New Game

```bash
curl -X POST http://localhost:3000/api/game \
  -b cookies.txt -c cookies.txt
```

---

## 2. Play the Moves

Execute the following move commands in order.

### Move 1 (e3, a5)
```bash
curl -X POST http://localhost:3000/api/game/move -H "Content-Type: application/json" -b cookies.txt -c cookies.txt -d '{"from": "e2", "to": "e3"}'
curl -X POST http://localhost:3000/api/game/move -H "Content-Type: application/json" -b cookies.txt -c cookies.txt -d '{"from": "a7", "to": "a5"}'
```

### Move 2 (Qh5, Ra6)
```bash
curl -X POST http://localhost:3000/api/game/move -H "Content-Type: application/json" -b cookies.txt -c cookies.txt -d '{"from": "d1", "to": "h5"}'
curl -X POST http://localhost:3000/api/game/move -H "Content-Type: application/json" -b cookies.txt -c cookies.txt -d '{"from": "a8", "to": "a6"}'
```

### Move 3 (Qxa5, h5)
```bash
curl -X POST http://localhost:3000/api/game/move -H "Content-Type: application/json" -b cookies.txt -c cookies.txt -d '{"from": "h5", "to": "a5"}'
curl -X POST http://localhost:3000/api/game/move -H "Content-Type: application/json" -b cookies.txt -c cookies.txt -d '{"from": "h7", "to": "h5"}'
```

### Move 4 (h4, Rah6)
```bash
curl -X POST http://localhost:3000/api/game/move -H "Content-Type: application/json" -b cookies.txt -c cookies.txt -d '{"from": "h2", "to": "h4"}'
curl -X POST http://localhost:3000/api/game/move -H "Content-Type: application/json" -b cookies.txt -c cookies.txt -d '{"from": "a6", "to": "h6"}'
```

### Move 5 (Qxc7, f6)
```bash
curl -X POST http://localhost:3000/api/game/move -H "Content-Type: application/json" -b cookies.txt -c cookies.txt -d '{"from": "a5", "to": "c7"}'
curl -X POST http://localhost:3000/api/game/move -H "Content-Type: application/json" -b cookies.txt -c cookies.txt -d '{"from": "f7", "to": "f6"}'
```

### Move 6 (Qxd7+, Kf7)
```bash
curl -X POST http://localhost:3000/api/game/move -H "Content-Type: application/json" -b cookies.txt -c cookies.txt -d '{"from": "c7", "to": "d7"}'
curl -X POST http://localhost:3000/api/game/move -H "Content-Type: application/json" -b cookies.txt -c cookies.txt -d '{"from": "e8", "to": "f7"}'
```

### Move 7 (Qxb7, Qd3)
```bash
curl -X POST http://localhost:3000/api/game/move -H "Content-Type: application/json" -b cookies.txt -c cookies.txt -d '{"from": "d7", "to": "b7"}'
curl -X POST http://localhost:3000/api/game/move -H "Content-Type: application/json" -b cookies.txt -c cookies.txt -d '{"from": "d8", "to": "d3"}'
```

### Move 8 (Qxb8, Qh7)
```bash
curl -X POST http://localhost:3000/api/game/move -H "Content-Type: application/json" -b cookies.txt -c cookies.txt -d '{"from": "b7", "to": "b8"}'
curl -X POST http://localhost:3000/api/game/move -H "Content-Type: application/json" -b cookies.txt -c cookies.txt -d '{"from": "d3", "to": "h7"}'
```

### Move 9 (Qxc8, Kg6)
```bash
curl -X POST http://localhost:3000/api/game/move -H "Content-Type: application/json" -b cookies.txt -c cookies.txt -d '{"from": "b8", "to": "c8"}'
curl -X POST http://localhost:3000/api/game/move -H "Content-Type: application/json" -b cookies.txt -c cookies.txt -d '{"from": "f7", "to": "g6"}'
```

### Move 10 (Qe6 - Stalemate)
```bash
curl -X POST http://localhost:3000/api/game/move -H "Content-Type: application/json" -b cookies.txt -c cookies.txt -d '{"from": "c8", "to": "e6"}'
```

---

## 3. Verify Game State

Check the final state of the game. Black has no legal moves, but the Black King is not in check.

```bash
curl -X GET http://localhost:3000/api/game \
  -b cookies.txt -c cookies.txt
```

The response should indicate `"status": "stalemate"` and `"winner": null`.
