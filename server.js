import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const port = process.env.WS_PORT || 8080;
const server = createServer();
const wss = new WebSocketServer({ server });

server.listen(port, () => {
  console.log(`Battleship WebSocket server running on ws://localhost:${port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Try: taskkill /F /PID 26800`);
    process.exit(1);
  }
  console.error('Server error:', error);
});

let players = [];
let gameState = null;

// Game states: "waiting", "placement", "ready", "playing", "finished"

function generateRandomShips() {
  // Ships: 5, 4, 3, 3, 2 (total of 17 cells)
  const shipSizes = [5, 4, 3, 3, 2];
  const occupied = new Set();
  const result = [];
  let shipId = 0;

  for (const size of shipSizes) {
    let placed = false;
    while (!placed) {
      const isHorizontal = Math.random() > 0.5;
      const row = Math.floor(Math.random() * 10);
      const col = Math.floor(Math.random() * 10);

      let valid = true;
      const positions = [];

      for (let i = 0; i < size; i++) {
        const r = isHorizontal ? row : row + i;
        const c = isHorizontal ? col + i : col;

        if (r >= 10 || c >= 10) {
          valid = false;
          break;
        }

        const pos = String.fromCharCode(65 + r) + (c + 1);
        if (occupied.has(pos)) {
          valid = false;
          break;
        }
        positions.push(pos);
      }

      if (valid) {
        positions.forEach(p => occupied.add(p));
        result.push({ id: shipId++, size, positions });
        placed = true;
      }
    }
  }

  return result;
}

function posToRC(pos) {
  const row = pos.charCodeAt(0) - 65;
  const col = parseInt(pos.substring(1)) - 1;
  return [row, col];
}

function rcToPos(r, c) {
  return String.fromCharCode(65 + r) + (c + 1);
}

function normalizeShips(input) {
  // If already array of ship objects with positions, return as-is
  if (!Array.isArray(input)) return [];
  if (input.length === 0) return [];
  if (typeof input[0] === 'object' && Array.isArray(input[0].positions)) {
    return input;
  }

  // Otherwise assume it's an array of position strings like ['A1','B1',...]
  const remaining = new Set(input);
  const ships = [];
  let shipId = 0;

  while (remaining.size > 0) {
    const it = remaining.values();
    const first = it.next().value;
    // try horizontal and vertical runs starting from first
    const [r0, c0] = posToRC(first);

    // horizontal: expand left and right on same row
    let left = c0;
    while (left - 1 >= 0 && remaining.has(rcToPos(r0, left - 1))) left--;
    let right = c0;
    while (right + 1 < 10 && remaining.has(rcToPos(r0, right + 1))) right++;
    const horiz = [];
    for (let c = left; c <= right; c++) horiz.push(rcToPos(r0, c));

    // vertical: expand up and down on same column
    let up = r0;
    while (up - 1 >= 0 && remaining.has(rcToPos(up - 1, c0))) up--;
    let down = r0;
    while (down + 1 < 10 && remaining.has(rcToPos(down + 1, c0))) down++;
    const vert = [];
    for (let r = up; r <= down; r++) vert.push(rcToPos(r, c0));

    // choose longer run
    const chosen = horiz.length >= vert.length ? horiz : vert;

    // If chosen length is 1 (isolated cell), try to find any neighbor to form a ship
    if (chosen.length === 1) {
      // search neighbors (right or down) to try build a small ship
      const neighbors = [ [r0, c0+1], [r0+1, c0], [r0, c0-1], [r0-1, c0] ];
      let found = false;
      for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < 10 && nc >=0 && nc < 10 && remaining.has(rcToPos(nr, nc))) {
          // build a two-cell ship
          const posA = rcToPos(r0, c0);
          const posB = rcToPos(nr, nc);
          chosen.push(posB);
          found = true;
          break;
        }
      }
      if (!found) {
        // fallback: just use the single cell
      }
    }

    // push chosen as a ship and remove from remaining
    ships.push({ id: shipId++, size: chosen.length, positions: chosen });
    for (const p of chosen) remaining.delete(p);
  }

  return ships;
}

function startGame() {
  gameState = {
    state: "playing",
    ships: {
      1: players[0].ships && players[0].ships.length ? players[0].ships : generateRandomShips(),
      2: players[1].ships && players[1].ships.length ? players[1].ships : generateRandomShips()
    },
    hits: {
      1: 0,
      2: 0
    },
    turn: 1,
    shots: {
      1: new Set(),
      2: new Set()
    }
  };

  console.log('Game started!');
  console.log('Player 1 ships:', gameState.ships[1]);
  console.log('Player 2 ships:', gameState.ships[2]);
  
  players[0].ws.send(JSON.stringify({ type: "gameStart", turn: 1 }));
  players[1].ws.send(JSON.stringify({ type: "gameStart", turn: 1 }));
}

function checkReadiness() {
  if (players.length === 2 && players[0].ready && players[1].ready) {
    startGame();
  }
}

wss.on("connection", (ws) => {
  if (players.length >= 2) {
    ws.send(JSON.stringify({ type: "full" }));
    ws.close();
    return;
  }

  const playerNum = players.length + 1;
  players.push({ ws, id: playerNum, ready: false, ships: [] });

  ws.send(JSON.stringify({ type: "assign", player: playerNum }));

  if (players.length === 2) {
    // Both players connected, start placement phase
    players[0].ws.send(JSON.stringify({ type: "phaseChange", phase: "placement" }));
    players[1].ws.send(JSON.stringify({ type: "phaseChange", phase: "placement" }));
  }

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      console.log(`Player ${data.player}:`, data);

      // Ship placement messages
      if (data.type === "setShips") {
        const playerIndex = data.player - 1;
        // normalize incoming ships (support both arrays of position-strings and ship objects)
        const normalized = normalizeShips(data.ships);
        players[playerIndex].ships = normalized;
        console.log(`Stored ships for player ${data.player}:`, JSON.stringify(normalized, null, 2));
        ws.send(JSON.stringify({ type: "shipsConfirmed" }));
      }

      if (data.type === "randomShips") {
        const playerIndex = data.player - 1;
        players[playerIndex].ships = generateRandomShips();
        ws.send(JSON.stringify({ 
          type: "shipsReady", 
          ships: players[playerIndex].ships 
        }));
      }

      if (data.type === "readyUp") {
        const playerIndex = data.player - 1;
        players[playerIndex].ready = true;
        console.log(`Player ${data.player} is ready`);
        
        // Notify both players of ready status
        players[0].ws.send(JSON.stringify({ 
          type: "readyStatus", 
          player1: players[0].ready, 
          player2: players[1].ready 
        }));
        players[1].ws.send(JSON.stringify({ 
          type: "readyStatus", 
          player1: players[0].ready, 
          player2: players[1].ready 
        }));
        
        checkReadiness();
      }

      // Game play messages
      if (data.type === "fire") {
        if (!gameState || gameState.state !== "playing") return;
        if (data.player !== gameState.turn) {
          ws.send(JSON.stringify({ type: "error", message: "Not your turn!" }));
          return;
        }

        const pos = String.fromCharCode(65 + data.row) + (data.col + 1);

        if (gameState.shots[data.player].has(pos)) {
          ws.send(JSON.stringify({ type: "error", message: "Already shot there!" }));
          return;
        }

        gameState.shots[data.player].add(pos);
        const enemy = data.player === 1 ? 2 : 1;

        // Determine hit by checking enemy ships positions
        let hit = false;
        const enemyShips = gameState.ships[enemy] || [];
        console.log(`Checking shot ${pos} against enemy ${enemy} ships:`);
        console.log(JSON.stringify(enemyShips, null, 2));
        for (const ship of enemyShips) {
          const contains = ship.positions && ship.positions.includes(pos);
          console.log(`  ship id=${ship.id} contains ${pos}? ${contains}`);
          if (contains) {
            hit = true;
            break;
          }
        }
        console.log(`Shots by player ${data.player}:`, Array.from(gameState.shots[data.player]));

        if (hit) gameState.hits[data.player]++;

        console.log(`Player ${data.player} shot at ${pos} - ${hit ? 'HIT' : 'MISS'} (${gameState.hits[data.player]}/17)`);

              // Notify shooter of the result and defender of incoming
              players[data.player - 1].ws.send(JSON.stringify({ type: "result", row: data.row, col: data.col, hit }));
              players[enemy - 1].ws.send(JSON.stringify({ type: "incoming", row: data.row, col: data.col, hit }));

              // If hit, check if that hit sunk a ship
              if (hit) {
                // find which ship on the enemy was hit
                const enemyShips = gameState.ships[enemy];
                if (Array.isArray(enemyShips)) {
                  for (const ship of enemyShips) {
                    if (ship.positions && ship.positions.includes(pos)) {
                      // Check if all positions of this ship have been shot by the shooter
                      const allShot = ship.positions.every(p => gameState.shots[data.player].has(p));
                      if (allShot) {
                        console.log(`Player ${data.player} sunk player ${enemy}'s ship id=${ship.id}`);
                        // Notify both players of sunk ship
                        players[0].ws.send(JSON.stringify({ type: "sunk", by: data.player, enemy, shipId: ship.id, positions: ship.positions }));
                        players[1].ws.send(JSON.stringify({ type: "sunk", by: data.player, enemy, shipId: ship.id, positions: ship.positions }));
                      }
                      break;
                    }
                  }
                }
              }

              // Win condition: 17 hits (all ships sunk)
              if (gameState.hits[data.player] >= 17) {
                console.log(`Player ${data.player} wins!`);
                players[0].ws.send(JSON.stringify({ type: "gameEnd", winner: data.player }));
                players[1].ws.send(JSON.stringify({ type: "gameEnd", winner: data.player }));
                gameState = null;
                players[0].ready = false;
                players[1].ready = false;
              } else {
                gameState.turn = enemy;
                // Send turn update to both players
                players[0].ws.send(JSON.stringify({ type: "turnUpdate", turn: gameState.turn }));
                players[1].ws.send(JSON.stringify({ type: "turnUpdate", turn: gameState.turn }));
              }
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.on("close", () => {
    console.log(`Player ${playerNum} disconnected`);
    players = [];
    gameState = null;
  });
});

