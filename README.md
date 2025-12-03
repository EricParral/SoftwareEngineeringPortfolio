# Battleship (Svelte + WebSocket)

A lightweight two-player Battleship game built with Svelte (frontend) and a small Node.js WebSocket server (backend). Two players can open the app in separate browser tabs, place ships (manual or random), and play turn-based attacks in real time.

**Project structure**
- `index.html` – app entry
- `src/` – Svelte app source
  - `App.svelte` – main router + WebSocket connection
  - `ShipPlacement.svelte` – ship placement UI
  - `Game.svelte` – battle UI (two grids)
  - `Grid.svelte` – reusable 10x10 grid component
  - `main.js` – app bootstrap
- `server.js` – Node.js WebSocket server (using `ws`)

**Requirements**
- Node.js 18+ recommended
- npm

**Install**
Open a terminal in the project root and run:

```powershell
npm install
```

**Run (development)**
Start the backend WebSocket server (default port 8081):

```powershell
$env:WS_PORT=8081; npm run start-server
```

Start the frontend dev server (Vite):

```powershell
npm run dev
```

Open the app in two browser tabs at:

```
http://localhost:5173
```

The frontend connects to the backend at `ws://<host>:8081`. By default App.svelte uses `window.location.hostname` so you can run the server locally and open multiple tabs.

**How to play**
1. Open two browser tabs and wait for both players to connect.
2. On the placement screen, place ships manually or click `Random & Start`.
3. Click `Confirm Ships` (or `Random & Start`). Both players must be ready before the game begins.
4. During the battle phase click cells on the enemy grid to fire. The UI shows hits (red), misses (grey), and sunk ships (orange). The status bar shows turn and a one-line result of the most recent shot.

**Controls**
- Placement:
  - Select a ship (unique buttons for duplicate sizes) and click a starting cell to place horizontally or vertically depending on the orientation toggle.
  - `Random & Start` generates a random layout and immediately marks you ready (sends your placement to the server so both client/server use the same coordinates).
  - `Confirm Ships` sends your manual placement to the server and marks you ready.
  - `Clear All` resets your placement locally.
- Battle:
  - Click cells on the enemy board to fire (only when it's your turn).

**Developer notes**
- The server expects ship info to be an array of ship objects with `{ id, size, positions }`. The client normalizes and sends `setShips` as such for both manual and random placement.
- The server tracks per-player shots and sends `result`, `incoming`, `turnUpdate`, `sunk`, and `gameEnd` messages.
- Grid cells are rendered with classes: `.ship` (your ships), `.hit`, `.miss`, and `.sunk` (orange for sunk ships).

**Troubleshooting**
- If WebSocket connection fails, ensure the server is running and the port (`WS_PORT`/8081) is not blocked.
- If you see unexpected misses, open the browser console and the server terminal to compare messages: the server logs `Player X: { type: 'fire', ... }` and additional debug lines when evaluating shots.

**Commands**
- Install dependencies: `npm install`
- Start backend: `$env:WS_PORT=8081; npm run start-server`
- Start frontend: `npm run dev`

**Contributing / Next improvements**
- Add replay / move history and undo for placement.
- Add persistent matchmaking / lobby.
- Add animations for hits/sinks and a replayable game log.
