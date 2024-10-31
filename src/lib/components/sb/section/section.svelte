<script lang="ts">
    import ActionBar from "./action-bar/actionBar.svelte";
    import * as Card from "$lib/components/ui/card";
    import Skeleton from "../../ui/skeleton/skeleton.svelte";
    import List from "./list/list.svelte";
    import Empty from "./empty.svelte";

    const SLOTS = $$props.$$slots;

    export let used: number | null = null,
        limit: number = 0,
        loading = false,
        list = false,
        action = !!SLOTS.add,
        name: string;
</script>

<div class="flex flex-col gap-2">
    <p class="lowercase text-sm opacity-80 font-extralight">
        {name}
    </p>
    {#if !loading && used != null && used > 0 && list}
        <List>
            <div class="border-b px-3 py-2">
                <ActionBar {used} {limit} {action}>
                    <slot name="add" />
                </ActionBar>
            </div>
            <slot />
        </List>
    {:else}
        <Card.Root>
            {#if loading}
                <div class="flex flex-col gap-2 p-5">
                    {#each Array(4) as _}
                        <Skeleton class="w-full h-16" />
                    {/each}
                </div>
            {:else if used == null || used > 0}
                {#if used != null}
                    <div class="border-b px-3 py-2">
                        <ActionBar {used} {limit} {action}>
                            <slot name="add" />
                        </ActionBar>
                    </div>
                {/if}
                <div class="flex flex-col gap-3 p-3">
                    <slot />
                </div>
            {:else}
                <div class="p-5 py-16">
                    <Empty type={name} {action}>
                        <slot name="add" />
                    </Empty>
                </div>
            {/if}
        </Card.Root>
    {/if}
</div>
