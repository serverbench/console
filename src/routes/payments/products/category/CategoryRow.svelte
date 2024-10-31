<script lang="ts">
    import DropdownItem from "$lib/components/sb/section/list/DropdownItem.svelte";
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import type StoreCategory from "$lib/sb/store/StoreCategory";
    import { Trash2 } from "lucide-svelte";
    import { createEventDispatcher } from "svelte";
    import CategorySetPicker from "./CategorySetPicker.svelte";
    import type StoreCategorySet from "$lib/sb/store/StoreCategorySet";

    const dispatch = createEventDispatcher();

    export let category: StoreCategory, sets: StoreCategorySet[];

    async function remove() {
        try {
            await category.delete();
            dispatch("remove");
        } catch (error) {}
    }
</script>

<Item>
    <span class="grow">
        {category.name}
    </span>
    <CategorySetPicker bind:category bind:sets />
    <div slot="dropdown">
        <DropdownItem on:click={() => remove()} destructive>
            <Trash2 />
            Delete
        </DropdownItem>
    </div>
</Item>
