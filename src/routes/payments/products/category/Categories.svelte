<script lang="ts">
    import Section from "$lib/components/sb/section/section.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import StoreCategory from "$lib/sb/store/StoreCategory";
    import { onMount } from "svelte";
    import CategoryRow from "./CategoryRow.svelte";
    import StoreCategorySet from "$lib/sb/store/StoreCategorySet";

    let loading = false;
    let creating = false
    let categories: StoreCategory[] = [];
    export let sets: StoreCategorySet[] = [];

    let categoryName = "";

    onMount(async () => {
        loading = true;
        try {
            categories = await StoreCategory.list();
            sets = await StoreCategorySet.list();
        } catch (error) {}
        loading = false;
    });

    async function createCategory() {
        creating = true;
        try {
            categories = [
                ...categories,
                await StoreCategory.create(categoryName),
            ];
            categoryName = "";
        } catch (error) {}
        creating = false;
    }
</script>

<Section list {loading} used={categories.length} limit={6} name="Categories">
    <div slot="add" class="flex flex-col gap-2">
        <Input
            disabled={creating}
            placeholder="Category Name"
            bind:value={categoryName}
        />
        <Button disabled={creating} on:click={() => createCategory()}>
            Create Category
        </Button>
    </div>
    {#each categories as category}
        <CategoryRow
            bind:sets
            bind:category
            on:remove={() =>
                (categories = categories.filter((c) => c.id != category.id))}
        />
    {/each}
</Section>
