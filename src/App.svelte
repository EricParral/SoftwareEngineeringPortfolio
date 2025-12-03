<script>
  import Game from './Game.svelte';
  import ShipPlacement from './ShipPlacement.svelte';

  let connected = false;
  let ws;
  let playerNum = null;
  let currentPhase = "waiting"; // waiting, placement, playing
  let status = "Connecting...";
  let messages = [];
  let myShips = [];

  function connect() {
    const wsUrl = `ws://${window.location.hostname}:8081`;
    console.log('Connecting to:', wsUrl);
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      connected = true;
      status = "Connected — Waiting for opponent...";
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      status = "Connection error. Make sure server is running on port 8081.";
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      connected = false;
      status = "Disconnected from server.";
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      console.log('App received:', data.type);
      
      // Store messages for reactive updates
      messages = [...messages, data];

      if (data.type === "assign") {
        playerNum = data.player;
        status = `You are Player ${playerNum}`;
      }

      if (data.type === "phaseChange") {
        currentPhase = data.phase;
        console.log('Phase changed to:', data.phase);
      }

      if (data.type === "gameStart") {
        currentPhase = "playing";
      }
    };
  }

  connect();
</script>

<h1>Battleship</h1>

{#if playerNum}
  <h2>Player {playerNum}</h2>
{/if}

<p>{status}</p>

{#if connected && playerNum}
  {#if currentPhase === "placement"}
    <ShipPlacement {playerNum} {ws} {messages} on:shipsPlaced={(e) => myShips = e.detail} />
  {:else if currentPhase === "playing"}
    <Game {playerNum} {ws} {messages} {myShips} />
  {:else}
    <p>Waiting for both players to connect...</p>
  {/if}
{:else if !connected}
  <p>⏳ Connecting to server...</p>
{:else}
  <p>⏳ Waiting for opponent...</p>
{/if}

<style>
  :global(body) {
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: 0;
    padding: 20px;
    min-height: 100vh;
  }

  h1 {
    text-align: center;
    color: #333;
    font-size: 2.5em;
    margin-bottom: 10px;
  }

  h2 {
    text-align: center;
    color: #666;
    font-size: 1.5em;
  }

  p {
    text-align: center;
    color: #666;
  }
</style>

