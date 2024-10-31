<script lang="ts">
    import DropdownItem from "$lib/components/sb/section/list/DropdownItem.svelte";
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import type StoreCategorySet from "$lib/sb/store/StoreCategorySet";
    import { Trash2 } from "lucide-svelte";
    import { createEventDispatcher } from "svelte";

    export let set: StoreCategorySet;
    let loading = false;

    const dispatch = createEventDispatcher();

    async function remove() {
        loading = true;
        try {
            await set.remove();
            dispatch("remove");
        } catch (error) {}
        loading = false;
    }
</script>

<Item>
    <span class="grow">
        {set.name}
    </span>
    <div slot="dropdown">
        <DropdownItem on:click={() => remove()} destructive>
            <Trash2 />
            Delete
        </DropdownItem>
    </div>
</Item>
