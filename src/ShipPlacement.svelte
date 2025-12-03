<script>
  import Grid from './Grid.svelte';
  import { createEventDispatcher } from 'svelte';

  export let playerNum;
  export let ws;
  export let messages = [];

  const dispatch = createEventDispatcher();

  let grid = Array.from({ length: 10 }, () => Array(10).fill(""));
  let ships = [];
  let selectedShipSize = null;
  let selectedShipId = null;
  let isPlacing = false;
  let placedShips = [];
  let ready = false;
  let opponent1Ready = false;
  let opponent2Ready = false;
  const initialAvailableShips = [
    { size: 5, id: 0 },
    { size: 4, id: 1 },
    { size: 3, id: 2 },
    { size: 3, id: 3 },
    { size: 2, id: 4 }
  ];
  let availableShips = initialAvailableShips.map(s => ({ ...s }));
  let isHorizontal = true;
  let nextShipIndex = 5;

  $: {
    // Process all messages
    messages.forEach(data => {
      if (data.type === "readyStatus") {
        opponent1Ready = data.player1;
        opponent2Ready = data.player2;
        console.log('Ship placement - Ready status updated:', { opponent1Ready, opponent2Ready });
      }
    });
  }

  function onCellClick(event) {
    console.log('Cell clicked in ShipPlacement:', event.detail);
    
    if (ready) {
      console.log('Already ready, cannot place ships');
      return;
    }
    
    const { row, col } = event.detail;
    
    if (selectedShipSize === null || selectedShipId === null) {
      alert('Select a ship size first');
      return;
    }

    console.log(`Attempting to place ship of size ${selectedShipSize} at [${row}, ${col}] - ${isHorizontal ? 'Horizontal' : 'Vertical'}`);

    // Check if ship can be placed
    for (let i = 0; i < selectedShipSize; i++) {
      const r = isHorizontal ? row : row + i;
      const c = isHorizontal ? col + i : col;
      
      if (r >= 10 || c >= 10) {
        alert('Ship goes out of bounds');
        return;
      }
      
      if (grid[r][c] !== "") {
        alert('Cell already occupied');
        return;
      }
    }

    // Place the entire ship with one click
    placeShip(row, col);
  }

  function placeShip(startRow, startCol) {
    console.log(`placeShip called with startRow=${startRow}, startCol=${startCol}, size=${selectedShipSize}`);
    const shipCells = [];
    
    for (let i = 0; i < selectedShipSize; i++) {
      const r = isHorizontal ? startRow : startRow + i;
      const c = isHorizontal ? startCol + i : startCol;
      console.log(`Ship cell ${i}: [${r}, ${c}]`);
      shipCells.push([r, c]);
    }
    
    // Create a new grid array for reactivity
    const newGrid = grid.map(row => [...row]);
    
    for (const [r, c] of shipCells) {
      newGrid[r][c] = `ship-${selectedShipId}`;
    }
    
    grid = newGrid;
    console.log('Grid updated, new grid:', grid);
    
    const shipPositions = shipCells.map(([r, c]) => String.fromCharCode(65 + r) + (c + 1));
    console.log('Ship positions:', shipPositions);
    
    placedShips.push({
      size: selectedShipSize,
      id: selectedShipId,
      positions: shipPositions
    });
    ships.push(...shipPositions);
    
    // Remove this ship from available options
    availableShips = availableShips.filter(ship => ship.id !== selectedShipId);
    
    selectedShipSize = null;
    selectedShipId = null;
    console.log('Ship of size placed! Remaining ships:', availableShips, 'Total cells:', ships.length);
  }

  function selectShipSize(size, id) {
    selectedShipSize = size;
    selectedShipId = id;
  }

  function randomPlacement() {
    // Reset grid
    grid = Array.from({ length: 10 }, () => Array(10).fill(""));
    ships = [];
    placedShips = [];
    
    const allShips = [
      { size: 5, id: 0 },
      { size: 4, id: 1 },
      { size: 3, id: 2 },
      { size: 3, id: 3 },
      { size: 2, id: 4 }
    ];
    
    for (const ship of allShips) {
      let placed = false;
      while (!placed) {
        const randomHorizontal = Math.random() > 0.5;
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        
        let valid = true;
        const positions = [];
        
        for (let i = 0; i < ship.size; i++) {
          const r = randomHorizontal ? row : row + i;
          const c = randomHorizontal ? col + i : col;
          
          if (r >= 10 || c >= 10) {
            valid = false;
            break;
          }
          if (grid[r][c] !== "") {
            valid = false;
            break;
          }
          positions.push([r, c]);
        }
        
        if (valid) {
          for (const [r, c] of positions) {
            grid[r][c] = `ship-${ship.id}`;
          }
          
          const shipPositions = positions.map(([r, c]) => String.fromCharCode(65 + r) + (c + 1));
          placedShips.push({
            size: ship.size,
            id: ship.id,
            positions: shipPositions
          });
          ships.push(...shipPositions);
          placed = true;
        }
      }
    }
    
    selectedShipSize = null;
    selectedShipId = null;
    availableShips = [];
    grid = grid;
  }

  function confirmShips() {
    if (ships.length !== 17) {
      alert('You must place all ships (17 cells total)');
      return;
    }
    
    ws.send(JSON.stringify({
      type: "setShips",
      player: playerNum,
      ships: placedShips
    }));
    
    dispatch('shipsPlaced', placedShips);
    ready = true;
    
    ws.send(JSON.stringify({
      type: "readyUp",
      player: playerNum
    }));
  }

  function useRandom() {
    randomPlacement();
    
    // Send the generated ship objects to the server so server and both clients
    // use the exact same random placement.
    ws.send(JSON.stringify({
      type: "setShips",
      player: playerNum,
      ships: placedShips
    }));

    dispatch('shipsPlaced', placedShips);
    ready = true;

    ws.send(JSON.stringify({
      type: "readyUp",
      player: playerNum
    }));
  }

  function clearAll() {
    // Reset placement state locally
    grid = Array.from({ length: 10 }, () => Array(10).fill(""));
    ships = [];
    placedShips = [];
    selectedShipSize = null;
    selectedShipId = null;
    ready = false;
    availableShips = initialAvailableShips.map(s => ({ ...s }));
    nextShipIndex = 5;
    // Let parent know ships were cleared (optional)
    dispatch('shipsPlaced', placedShips);
    console.log('Placement cleared');
  }
</script>

<div class="placement-container">
  <h2>Player {playerNum} - Ship Placement</h2>
  
  <div class="status">
    <p>Player 1: {playerNum === 1 ? (ready ? "✓ Ready" : "Placing...") : (opponent1Ready ? "✓ Ready" : "Placing...")}</p>
    <p>Player 2: {playerNum === 2 ? (ready ? "✓ Ready" : "Placing...") : (opponent2Ready ? "✓ Ready" : "Placing...")}</p>
  </div>

  {#if !ready}
    <div class="controls">
      <div class="ship-selector">
        <h3>Select Ship Size to Place</h3>
        <div class="ship-buttons">
          {#each availableShips as ship, idx (ship.id)}
            <button 
              on:click={() => selectShipSize(ship.size, ship.id)}
              class={selectedShipId === ship.id ? 'selected' : ''}
            >
              Ship {ship.size}
            </button>
          {/each}
        </div>
        
        <div class="orientation-toggle">
          <label>
            <input type="radio" bind:group={isHorizontal} value={true} />
            Horizontal
          </label>
          <label>
            <input type="radio" bind:group={isHorizontal} value={false} />
            Vertical
          </label>
        </div>
      </div>
      
      <div class="button-group">
        <button class="confirm-btn" on:click={confirmShips}>Confirm Ships</button>
        <button class="random-btn" on:click={useRandom}>Random & Start</button>
        <button class="clear-btn" on:click={clearAll}>Clear All</button>
      </div>
    </div>
  {:else}
    <p class="ready-message">✓ Your ships are placed and ready!</p>
    {#if opponent1Ready && opponent2Ready}
      <p class="waiting-game">✓ Both players ready - Game starting soon...</p>
    {:else}
      <p class="waiting-opponent">⏳ Waiting for opponent to place ships and ready up...</p>
    {/if}
  {/if}

  <div class="grid-container">
    <h3>Your Board</h3>
    <Grid {grid} clickable={!ready} on:cellclick={onCellClick} />
    {#if selectedShipSize}
      <p class="info">📍 Click to place ship of size {selectedShipSize} ({isHorizontal ? "→ Horizontal" : "↓ Vertical"})</p>
    {:else if !ready && availableShips.length > 0}
      <p class="info">Select a ship size above, then click a cell to place it</p>
    {/if}
  </div>
</div>

<style>
  .placement-container {
    padding: 20px;
    max-width: 600px;
  }

  .status {
    background: #f0f0f0;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 20px;
    font-weight: bold;
  }

  .controls {
    margin-bottom: 20px;
  }

  .ship-selector {
    margin-bottom: 15px;
  }

  .ship-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 10px 0;
  }

  .ship-buttons button {
    padding: 10px 15px;
    background: #ddd;
    border: 2px solid #999;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
  }

  .ship-buttons button.selected {
    background: #4CAF50;
    color: white;
    border-color: #2e7d32;
  }

  .orientation-toggle {
    margin-top: 15px;
    display: flex;
    gap: 20px;
  }

  .orientation-toggle label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-weight: bold;
  }

  .orientation-toggle input[type="radio"] {
    cursor: pointer;
    width: 18px;
    height: 18px;
  }

  .button-group {
    display: flex;
    gap: 10px;
  }

  .confirm-btn, .random-btn {
    padding: 12px 20px;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
  }

  .confirm-btn {
    background: #2196F3;
    color: white;
  }

  .confirm-btn:hover {
    background: #0b7dda;
  }

  .random-btn {
    background: #FF9800;
    color: white;
  }

  .random-btn:hover {
    background: #e68900;
  }

  .ready-message {
    background: #4CAF50;
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-weight: bold;
  }

  .waiting-opponent {
    background: #FFF3CD;
    color: #856404;
    padding: 10px;
    border-radius: 5px;
  }

  .waiting-game {
    background: #4CAF50;
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-weight: bold;
  }

  .grid-container {
    margin-top: 20px;
  }

  .info {
    margin-top: 10px;
    color: #666;
    font-size: 14px;
  }
</style>
