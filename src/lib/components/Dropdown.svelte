<script lang="ts">
  export let filteredItems: string[] = [];
  export let dropdownPosition = { top: 0, left: 0 };
  export let onSelect = (item: string) => {};

  let selectedIndex: number = 0;

  // Handle keyboard navigation for up, down, and enter keys
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      selectedIndex = (selectedIndex + 1) % filteredItems.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      selectedIndex =
        (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
    } else if (event.key === 'Enter') {
      event.preventDefault();
      onSelect(filteredItems[selectedIndex]);
    }
  };

  // Attach keydown listener on mount and remove it on destroy
  import { onMount } from 'svelte';

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  });

  // Handle mouse hover to select item
  const handleMouseEnter = (index: number) => {
    selectedIndex = index;
  };

  const handleClick = (item: string) => {
    onSelect(item);
  };
</script>

<div
  class="dropdown"
  style="position: fixed; top: {dropdownPosition.top}px; left: {dropdownPosition.left}px; width: 200px; max-height: 250px; overflow-y: auto; background-color: #fff; border: 1px solid #ccc; border-radius: 4px; z-index: 1000; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);"
>
  {#each filteredItems as item, index}
    <div
      class="dropdown-item"
      on:mouseenter={() => handleMouseEnter(index)}
      on:click={() => handleClick(item)}
      style="padding: 10px; cursor: pointer; background-color: {index ===
      selectedIndex
        ? '#f1f1f1'
        : '#fff'}; border-bottom: 1px solid #eee;"
    >
      {item}
    </div>
  {/each}
</div>

<style>
  .dropdown-item {
    padding: 10px;
    cursor: pointer;
    background-color: white;
    border-bottom: 1px solid #eee;
  }

  .dropdown-item:hover {
    background-color: #f1f1f1;
  }
</style>
