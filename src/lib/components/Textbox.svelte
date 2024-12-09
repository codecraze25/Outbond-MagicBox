<script lang="ts">
  import { selectedRowIDs } from '$lib/stores/columns';
  import { notifications } from '$lib/stores/notification';
  import { data, tableHead } from '../data/data';
  import Dropdown from './Dropdown.svelte';
  import { onMount } from 'svelte';
  import Toast from './Toast.svelte';

  // Type for dropdown position
  interface DropdownPosition {
    top: number;
    left: number;
  }

  // Type for the editable div range saving
  let showDropdown: boolean = false;
  let dropdownPosition: DropdownPosition = { top: 0, left: 0 };
  let filteredItems: string[] = tableHead;
  let currentQuery: string = '';
  let savedRange: Range | null = null;
  let prompt: string = '';

  let editableDiv: HTMLElement | null = null;

  // Handle input change inside the contenteditable div
  const handleInputChange = (): void => {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);

    if (editableDiv && range) {
      const { startContainer, startOffset } = range;

      if (startContainer.nodeType === Node.TEXT_NODE) {
        const textContent = startContainer.textContent;
        const slashIndex = textContent?.lastIndexOf('/');

        if (slashIndex !== -1 && startOffset > slashIndex) {
          const query = textContent
            ?.slice(slashIndex + 1, startOffset)
            .toLowerCase();
          currentQuery = query || '';
          filteredItems = tableHead.filter((item) =>
            item.toLowerCase().includes(query || '')
          );

          if (!showDropdown) {
            const rect = range.getBoundingClientRect();
            dropdownPosition = { top: rect.bottom, left: rect.left };
            showDropdown = true;
          }

          savedRange = range.cloneRange();
        } else {
          showDropdown = false;
        }
      }
    }
  };

  // Handle item selection from the dropdown
  const handleSelectItem = (item: string): void => {
    if (editableDiv && savedRange) {
      editableDiv.focus();
      const range = savedRange;

      if (range.startContainer.nodeType === Node.TEXT_NODE) {
        const textContent = range.startContainer.textContent;
        const slashIndex = textContent?.lastIndexOf('/');

        if (slashIndex !== -1) {
          range.setStart(range.startContainer, slashIndex);
          range.deleteContents();
        }
      }

      if ($selectedRowIDs.length === 1) {
        // Create a chip element
        const chip = document.createElement('span');
        chip.contentEditable = 'false';

        const selectedItem = data.find(
          (item) => item.id === $selectedRowIDs[0]
        );
        chip.setAttribute('data', selectedItem![item]);
        chip.innerText = item;
        chip.classList.add(
          'inline-block',
          'bg-cyan-600',
          'border',
          'border-transparent',
          'rounded-full',
          'px-2.5',
          'py-0.5',
          'text-sm',
          'shadow-sm',
          'text-white',
          'cursor-pointer'
        );

        const space = document.createTextNode(' ');
        range.insertNode(space);
        range.insertNode(chip);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        const newRange = document.createRange();
        newRange.setStartAfter(space);
        newRange.collapse(true); // Collapse the range to a single point
        selection?.addRange(newRange); // Set the new range as the current selection
        savedRange = null; // Clear saved range
      } else {
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        notifications.warning(
          'To continue, please select a column from the list',
          2000
        );
      }

      showDropdown = false;
    }
  };

  // Handle click outside of the editable div or dropdown
  const handleClickOutside = (event: MouseEvent): void => {
    if (
      editableDiv &&
      !editableDiv.contains(event.target as Node) &&
      !event.target?.closest('.dropdown') // Prevent closing when clicking inside the dropdown
    ) {
      showDropdown = false;
    }
  };

  // Extract the content from the editable div
  const extractContent = (element: HTMLElement): string => {
    const result: string[] = [];
    element.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        result.push(child.textContent?.trim() || '');
      } else if (
        child.nodeType === Node.ELEMENT_NODE &&
        (child as HTMLElement).tagName === 'SPAN'
      ) {
        result.push((child as HTMLElement).getAttribute('data') || '');
      }
    });

    return result.join(' ');
  };

  // Button click event
  const buttonClicked = (): void => {
    prompt = extractContent(editableDiv!);
  };

  // Add the event listener to close the dropdown when clicking outside
  onMount(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });
</script>

<div class="relative w-full p-2">
  <div
    bind:this={editableDiv}
    contenteditable
    on:input={handleInputChange}
    class="min-h-[150px] block p-2.5 w-full text-sm text-gray-900 bg-white dark:bg-gray-700 rounded-lg shadow-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
  ></div>
  {#if showDropdown && filteredItems.length > 0}
    <Dropdown
      {filteredItems}
      {dropdownPosition}
      onSelect={handleSelectItem}
    />
  {/if}
</div>

<button
  on:click={buttonClicked}
  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2"
>
  Show Prompt
</button>

<Toast />

<p class="text-md text-gray-900 dark:text-white mx-2">{prompt}</p>
