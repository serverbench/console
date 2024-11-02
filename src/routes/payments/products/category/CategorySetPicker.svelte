<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import StoreCategory from "$lib/sb/store/StoreCategory";
    import { Check, Plus, Tag } from "lucide-svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import StoreCategorySet from "$lib/sb/store/StoreCategorySet";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import Input from "$lib/components/ui/input/input.svelte";

    let creating = false;
    let loading = false;

    let name: string = "";

    export let category: StoreCategory, sets: StoreCategorySet[];

    async function createSet() {
        loading = true;
        try {
            const set = await StoreCategorySet.create(name, category);
            category.sets.push(set);
            category = category;
            sets = [...sets, set];
            name = "";
            creating = false;
        } catch (error) {}
        loading = false;
    }

    async function toggleSet(set: StoreCategorySet) {
        loading = true;
        const added = category.sets.find((s) => s.id == set.id);
        try {
            if (added) {
                category = await set.unuseSet(category);
            } else {
                category = await set.useSet(category);
            }
            category = category;
            sets = await StoreCategorySet.list();
        } catch (error) {}
        loading = false;
    }
</script>

<Dialog.Root bind:open={creating}>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Create Category Set</Dialog.Title>
        </Dialog.Header>
        <div class="flex flex-col gap-2">
            <Input
                disabled={loading}
                bind:value={name}
                placeholder="Set Name"
            />
        </div>
        <Dialog.Footer>
            <Button
                disabled={loading}
                on:click={() => createSet()}
                type="submit">Create Set</Button
            >
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<DropdownMenu.Root>
    <DropdownMenu.Trigger asChild let:builder>
        <Button class="rounded-full" builders={[builder]} variant="outline">
            <Tag />
            {category.sets.length} set{category.sets.length == 1 ? "" : "s"}
        </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="w-56">
        {#if sets.length > 0}
            {#each sets as set}
                <DropdownMenu.Item on:click={() => toggleSet(set)}>
                    {#if category.sets.find((s) => s.id == set.id)}
                        <Check />
                    {:else}
                        <Check class="opacity-0" />
                    {/if}
                    <span>{set.name}</span>
                </DropdownMenu.Item>
            {/each}
            <DropdownMenu.Separator />
        {/if}
        <DropdownMenu.Item on:click={() => (creating = true)}>
            <Plus />
            <span>Create Set</span>
        </DropdownMenu.Item>
    </DropdownMenu.Content>
</DropdownMenu.Root>
