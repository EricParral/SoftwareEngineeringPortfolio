<script>
  import { createEventDispatcher } from 'svelte';
  
  export let grid;
  export let clickable = true;

  const dispatch = createEventDispatcher();

  function clickCell(row, col) {
    if (clickable) {
      console.log(`Grid clicked cell [${row}, ${col}], dispatching cellclick event`);
      dispatch('cellclick', { row, col });
    } else {
      console.log(`Grid cell clicked but not clickable`);
    }
  }
</script>

<div class="grid">
  {#each grid as row, r}
    {#each row as cell, c}
      <button
        type="button"
        class="cell"
        class:ship={typeof cell === 'string' && cell.startsWith("ship")}
        class:hit={cell === "hit"}
        class:miss={cell === "miss"}
        class:sunk={cell === "sunk"}
        disabled={!clickable}
        on:click={() => clickCell(r, c)}
      >
      </button>
    {/each}
  {/each}
</div>

<style>
.grid {
  display: grid;
  grid-template-columns: repeat(10, 40px);
  gap: 2px;
  padding: 10px;
  background: #e3f2fd;
  border-radius: 5px;
  width: fit-content;
}

.cell {
  width: 40px;
  height: 40px;
  border: 2px solid #1976d2;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #bbdefb;
  font-weight: bold;
  font-size: 16px;
  padding: 0;
  cursor: pointer;
}

.cell:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.cell:not(:disabled):hover:not(.ship):not(.hit):not(.miss) {
  background: #90caf9;
}

.cell.ship {
  background: #000000;
  color: white;
}

.cell.hit {
  background: #f44336;
  color: white;
}

.cell.miss {
  background: #9e9e9e;
  color: white;
}

.cell.sunk {
  background: #ff9800;
  color: white;
}

.cell.ship:not(:disabled):hover {
  background: #333333;
}

.cell.hit:not(:disabled):hover {
  background: #da190b;
}

.cell.miss:not(:disabled):hover {
  background: #757575;
}
</style>


