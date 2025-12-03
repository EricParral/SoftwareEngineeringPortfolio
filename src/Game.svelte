<script>
  import Grid from './Grid.svelte';

  export let playerNum;
  export let ws;
  export let messages = [];
  export let myShips = [];

  let myGrid = Array.from({ length: 10 }, () => Array(10).fill(""));
  let enemyGrid = Array.from({ length: 10 }, () => Array(10).fill(""));

  // Initialize myGrid with placed ships
  $: if (myShips.length > 0) {
    const newGrid = Array.from({ length: 10 }, () => Array(10).fill(""));
    myShips.forEach(ship => {
      if (ship.positions) {
        ship.positions.forEach(pos => {
          const row = pos.charCodeAt(0) - 65;
          const col = parseInt(pos.substring(1)) - 1;
          newGrid[row][col] = `ship-${ship.id}`;
        });
      }
    });
    myGrid = newGrid;
  }

  // Process messages incrementally to avoid re-processing older messages
  let lastMsgIndex = 0;
  $: if (messages && messages.length > lastMsgIndex) {
    for (let i = lastMsgIndex; i < messages.length; i++) {
      const data = messages[i];
      console.log('Game processing message (incremental):', data.type, data);

      if (data.type === "gameStart") {
        gameActive = true;
        status = data.turn === playerNum ? "Your turn - Click enemy grid!" : "Opponent's turn";
        myTurn = data.turn === playerNum;
        lastActionResult = "";
        console.log('Game started, myTurn:', myTurn);
      }

      if (data.type === "result") {
        const { row, col, hit } = data;
        enemyGrid[row][col] = hit ? "hit" : "miss";
        status = `You shot ${hit ? "HIT! ✓" : "MISS"}! Opponent's turn`;
        myTurn = false;
        lastActionResult = hit ? 'Your shot: HIT' : 'Your shot: MISS';
      }

      if (data.type === "incoming") {
        const { row, col, hit } = data;
        myGrid[row][col] = hit ? "hit" : "miss";
        status = `Opponent shot ${hit ? "HIT! ✓" : "MISS"}! Your turn`;
        myTurn = true;
        lastActionResult = hit ? 'Opponent shot: HIT' : 'Opponent shot: MISS';
      }

      if (data.type === "turnUpdate") {
        myTurn = data.turn === playerNum;
        status = myTurn ? "Your turn - Click enemy grid!" : "Opponent's turn";
        console.log('Turn updated, myTurn:', myTurn);
      }

      if (data.type === "sunk") {
        if (data.by === playerNum) {
          data.positions.forEach(pos => {
            const row = pos.charCodeAt(0) - 65;
            const col = parseInt(pos.substring(1)) - 1;
            enemyGrid[row][col] = 'sunk';
          });
          lastActionResult = 'You sunk a ship!';
        } else if (data.enemy === playerNum) {
          data.positions.forEach(pos => {
            const row = pos.charCodeAt(0) - 65;
            const col = parseInt(pos.substring(1)) - 1;
            myGrid[row][col] = 'sunk';
          });
          lastActionResult = 'One of your ships was sunk!';
        }
      }

      if (data.type === "gameEnd") {
        const won = data.winner === playerNum;
        status = won ? " YOU WIN! " : " YOU LOSE! ";
        myTurn = false;
        gameActive = false;
        lastActionResult = "";
      }

      if (data.type === "error") {
        status = `Error: ${data.message}`;
      }
    }
    lastMsgIndex = messages.length;
  }

  let status = "Game starting...";
  let myTurn = false;
  let gameActive = false;
  let lastActionResult = "";

  $: if (messages && messages.length > 0) {
    const data = messages[messages.length - 1];
    console.log('Game processing message (latest):', data.type, data);
    if (data.type === "gameStart") {
      gameActive = true;
      status = data.turn === playerNum ? "Your turn - Click enemy grid!" : "Opponent's turn";
      myTurn = data.turn === playerNum;
      lastActionResult = "";
      console.log('Game started, myTurn:', myTurn);
    }

    if (data.type === "result") {
      const { row, col, hit } = data;
      enemyGrid[row][col] = hit ? "hit" : "miss";
      status = `You shot ${hit ? "HIT! ✓" : "MISS"}! Opponent's turn`;
      myTurn = false;
      lastActionResult = hit ? 'Your shot: HIT' : 'Your shot: MISS';
    }

    if (data.type === "incoming") {
      const { row, col, hit } = data;
      myGrid[row][col] = hit ? "hit" : "miss";
      status = `Opponent shot ${hit ? "HIT! ✓" : "MISS"}! Your turn`;
      myTurn = true;
      lastActionResult = hit ? 'Opponent shot: HIT' : 'Opponent shot: MISS';
    }

    if (data.type === "turnUpdate") {
      myTurn = data.turn === playerNum;
      status = myTurn ? "Your turn - Click enemy grid!" : "Opponent's turn";
      console.log('Turn updated, myTurn:', myTurn);
    }

    if (data.type === "sunk") {
      // data: { type: 'sunk', by, enemy, shipId, positions }
      if (data.by === playerNum) {
        // we sunk an enemy ship - mark enemyGrid
        data.positions.forEach(pos => {
          const row = pos.charCodeAt(0) - 65;
          const col = parseInt(pos.substring(1)) - 1;
          enemyGrid[row][col] = 'sunk';
        });
        lastActionResult = 'You sunk a ship!';
      } else if (data.enemy === playerNum) {
        // our ship was sunk by opponent - mark myGrid
        data.positions.forEach(pos => {
          const row = pos.charCodeAt(0) - 65;
          const col = parseInt(pos.substring(1)) - 1;
          myGrid[row][col] = 'sunk';
        });
        lastActionResult = 'One of your ships was sunk!';
      }
    }

    if (data.type === "gameEnd") {
      const won = data.winner === playerNum;
      status = won ? " YOU WIN! " : " YOU LOSE! ";
      myTurn = false;
      gameActive = false;
      lastActionResult = "";
    }

    if (data.type === "error") {
      status = `Error: ${data.message}`;
    }
  }

  function onEnemyCellClick(event) {
    console.log('Enemy cell clicked:', event.detail, 'gameActive:', gameActive, 'myTurn:', myTurn);
    if (!gameActive || !myTurn) {
      console.log('Cannot click: gameActive=', gameActive, 'myTurn=', myTurn);
      return;
    }
    
    const { row, col } = event.detail;
    
    // Don't allow clicking same spot twice
    if (enemyGrid[row][col] !== "") {
      console.log('Cell already attacked:', row, col);
      return;
    }

    console.log('Firing at:', row, col);
    ws.send(JSON.stringify({
      type: "fire",
      row,
      col,
      player: playerNum
    }));
  }
</script>

<div class="game-container">
  <h2>Player {playerNum} - Battle</h2>
  
  <div class="status-bar" class:my-turn={myTurn} class:game-over={!gameActive}>
    <h3>{status}</h3>
    {#if lastActionResult}
      <p class="shot-result">{lastActionResult}</p>
    {/if}
  </div>

  <div class="grid-wrapper">
    <div class="grid-section">
      <h3>Your Grid</h3>
      <Grid grid={myGrid} clickable={false} />
    </div>

    <div class="grid-section">
      <h3>Enemy Grid {myTurn ? "📍" : ""}</h3>
      <Grid 
        grid={enemyGrid} 
        clickable={gameActive && myTurn} 
        on:cellclick={onEnemyCellClick}
      />
    </div>
  </div>
</div>

<style>
  .game-container {
    padding: 20px;
    max-width: 900px;
    margin: 0 auto;
  }

  .status-bar {
    padding: 15px;
    border-radius: 5px;
    margin-bottom: 20px;
    text-align: center;
    background: #fff3cd;
    border: 2px solid #ffc107;
  }

  .status-bar.my-turn {
    background: #d4edda;
    border-color: #28a745;
    color: #155724;
  }

  .status-bar.game-over {
    background: #d1ecf1;
    border-color: #17a2b8;
  }

  .status-bar h3 {
    margin: 0;
    font-size: 18px;
  }

  .shot-result {
    margin: 6px 0 0 0;
    font-size: 14px;
    color: #444;
  }

  .grid-wrapper {
    display: flex;
    gap: 30px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .grid-section {
    flex: 0 1 auto;
  }

  .grid-section h3 {
    text-align: center;
    margin-bottom: 10px;
  }
</style>

