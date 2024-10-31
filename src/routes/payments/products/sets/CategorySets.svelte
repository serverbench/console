<script lang="ts">
    import Section from "$lib/components/sb/section/section.svelte";
    import StoreCategorySet from "$lib/sb/store/StoreCategorySet";
    import CategorySetRow from "./CategorySetRow.svelte";

    export let sets: StoreCategorySet[] = [];
</script>

<Section list used={sets.length} name="Category Sets">
    {#each sets as set}
        <CategorySetRow
            {set}
            on:remove={() => (sets = sets.filter((s) => s.id != set.id))}
        />
    {/each}
</Section>
