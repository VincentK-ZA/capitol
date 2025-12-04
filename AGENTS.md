# Capitolli -- MVP Spec (Real-time v0.2)

## 0. High-level Overview

**Capitolli** is a lightweight, browser-based, **real-time** territory
control game.

- **Players:** up to 7 human players
- **Board:** 2D top-down hex grid
- **Goal:** control the most castles when the match timer ends
- **Play style:** real-time, everyone moves simultaneously
- **Tech:** HTML, CSS, vanilla JS, Node.js WebSocket server

Optimized for: - Running on a local dev machine - LAN browser
multiplayer (port 8080) - Minimal, clean code for easy hacking and Codex
assistance

---

## 1. Tech Stack

### Client

- `index.html`, `styles.css`, `main.js`
- Optional modules:
  - `gameState.js`
  - `render.js`
  - `network.js`

### Server

- Node.js (LTS)
- Minimal HTTP + WebSocket server
- Authoritative game loop + state ticker

### Persistence

- In-memory game state
- Append match summary to `results.json`

---

## 2. Core Game Concepts

### Board (Hex Grid)

- 15×15 grid (configurable)
- Tiles contain:
  - coordinates
  - type: `land` or `castle`
  - ownerId
  - units (count)

### Player

- id 1--7
- name
- color (optional)
- connected bool

### Units

- Stored as counts per tile
- Owned by exactly one player per tile

### Castles

- Special tiles
- Spawn new units periodically
- Controlled by tile owner

---

## 3. Real‑time Game Flow

### Match Parameters

- Up to 7 players
- Match duration: 10 minutes (configurable)
- Win: most castles → tie-break: most units

### Server Tick Loop

- `TICK_RATE = 200ms`
- Each tick:
  - process movement commands
  - resolve combat
  - apply spawning (every N ticks)
  - broadcast state

### Setup Phase

- Generate board
- Randomly place castles
- Spawn each player with:
  - 1 tile start
  - INITIAL_UNITS (default 5)

---

## 4. Real‑time Movement & Combat

### Movement

- Clients send:

```{=html}
<!-- -->
```

    {
      type: "move",
      playerId,
      from: {q, r},
      to:   {q, r},
      amount
    }

Rules: - Move only from owned tiles - Adjacent hex only - Amount ≤ units
on tile - Source tile cooldown: e.g. 500ms

### Combat Logic

Let A = attacker units\
Let D = defender units

Rules: - If `A >= D + 1` → attacker wins\
Remaining = A − D\
Tile owner becomes attacker\

- Else → defender wins\
  Attacking units destroyed

Multiple attacks in same tick processed in player ID order.

---

## 5. Spawning (Real‑time)

Every `SPAWN_INTERVAL_TICKS`: - For each owned castle: -
`spawnAmount = min(units, MAX_SPAWN_PER_CASTLE)` - tile.units +=
spawnAmount

---

## 6. Networking Protocol

### Client → Server

- `join_game`
- `move`
- `ready`

### Server → Client

- `game_state`
- `event`
- `game_over`

---

## 7. Data Structures

### Tile

    class Tile {
      constructor(q, r) {
        this.q = q;
        this.r = r;
        this.type = "land"; // or "castle"
        this.ownerId = null;
        this.units = 0;
      }
    }

### Player

    class Player {
      constructor(id, name) {
        this.id = id;
        this.name = name;
        this.color = null;
        this.connected = false;
      }
    }

### Game State

    const gameState = {
      players: [],
      board: { tiles: [], width: 15, height: 15 },
      startedAt: null,
      endsAt: null,
      status: "lobby",
      tick: 0
    };

---

## 8. UI / UX

### Basic Interaction

- Click a tile to select
- Adjacent tiles highlight
- Click destination → prompt for units to move

### HUD

- Match timer
- Castle ownership summary
- Unit counts (optional)

### Event Log

- Castle captured messages
- Combat results

---

## 9. Configurable Constants

    BOARD_WIDTH = 15
    BOARD_HEIGHT = 15
    CASTLE_COUNT = 15

    MATCH_DURATION_MS = 10 * 60 * 1000
    TICK_RATE_MS = 200
    SPAWN_INTERVAL_TICKS = 10

    INITIAL_UNITS = 5
    MAX_SPAWN_PER_CASTLE = 10
    MOVE_COOLDOWN_MS = 500

---

## 10. Implementation Order

1.  Single-player simulation (no server)
2.  Move logic to Node server
3.  WebSocket commands
4.  Multiplayer joining
5.  Timer + game over logic
6.  UI polish + result logging

---

## End of MVP Spec
