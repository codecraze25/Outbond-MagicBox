<script lang="ts">
  import { selectedRowIDs } from '$lib/stores/columns';
  import { data, tableHead } from '../data/data';

  let isAllSelected = false; // Track if all rows are selected

  // Handle select all functionality
  const handleSelectAll = (event: Event) => {
    const checked = (event.target as HTMLInputElement).checked;
    isAllSelected = checked;
    selectedRowIDs.set(checked ? data.map((item) => item.id) : []);
  };

  // Handle row select/deselect
  const handleRowSelect = (event: Event, rowId: number) => {
    const checked = (event.target as HTMLInputElement).checked;
    selectedRowIDs.update((selectedIds) => {
      return checked
        ? [...selectedIds, rowId]
        : selectedIds.filter((id) => id !== rowId);
    });
  };

  // Reactively update if all rows are selected based on the selectedRowIDs store
  $: isAllSelected = $selectedRowIDs.length === data.length;
</script>

<div class="relative overflow-x-auto shadow-md sm:rounded-lg mx-2">
  <table
    class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
  >
    <thead
      class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
    >
      <tr>
        <th
          scope="col"
          class="p-4"
        >
          <div class="flex items-center">
            <input
              id="checkbox-all"
              type="checkbox"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              on:change={handleSelectAll}
              checked={isAllSelected}
            />
            <label
              for="checkbox-all"
              class="sr-only">checkbox</label
            >
          </div>
        </th>
        {#each tableHead as head}
          <th
            scope="col"
            class="px-6 py-3">{head}</th
          >
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each data as item (item.id)}
        <tr
          class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <td class="w-4 p-4">
            <div class="flex items-center">
              <input
                id={`checkbox-table-${item.id}`}
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                on:change={(e) => handleRowSelect(e, item.id)}
                checked={$selectedRowIDs.includes(item.id)}
              />
              <label
                for={`checkbox-table-${item.id}`}
                class="sr-only">checkbox</label
              >
            </div>
          </td>
          {#each tableHead as head}
            <td class="px-6 py-4">{item[head]}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
