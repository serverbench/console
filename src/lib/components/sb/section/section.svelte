<script lang="ts">
    import ActionBar from "./action-bar/actionBar.svelte";
    import * as Card from "$lib/components/ui/card";
    import Skeleton from "../../ui/skeleton/skeleton.svelte";
    import List from "./list/list.svelte";
    import Empty from "./empty.svelte";
    import * as Tabs from "$lib/components/ui/tabs/index.js";

    const SLOTS = $$props.$$slots;

    import type { ComponentType } from "svelte";
    import Button from "$lib/components/ui/button/button.svelte";

    export let used: number | null = null,
        limit: number = 0,
        loading = false,
        list = false,
        action = !!(SLOTS && SLOTS.add),
        hideName = false,
        small = false,
        tabs: Record<string, ComponentType> | null = null,
        name: string;

    export let tab: string = tabs ? Object.keys(tabs)[0] : "";
</script>

{#if list && tabs}
    <Tabs.Root bind:value={tab}>
        <Tabs.List
            class="flex flex-row w-full gap-2 justify-start overflow-x-auto"
        >
            {#each Object.entries(tabs) as [key, icon]}
                <Tabs.Trigger class="capitalize" disabled={loading} value={key}>
                    <svelte:component this={icon} />
                    {key}
                </Tabs.Trigger>
            {/each}
        </Tabs.List>
        <slot />
    </Tabs.Root>
{:else}
    <div class="flex flex-col gap-2">
        {#if !hideName}
            <p class="lowercase text-sm opacity-80 font-extralight">
                {name}
            </p>
        {/if}
        {#if !loading && used != null && used > 0 && list}
            <List>
                {#if action || limit}
                    <div class="border-b px-3 py-2">
                        <ActionBar {used} {limit} {action}>
                            <slot name="add" />
                        </ActionBar>
                    </div>
                {/if}
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
                    {#if used != null && list && !tabs}
                        <div class="border-b px-3 py-2">
                            <ActionBar {used} {limit} {action}>
                                <slot name="add" />
                            </ActionBar>
                        </div>
                    {:else if !list && tabs}
                        <Tabs.Root bind:value={tab}>
                            <div class="border-b px-3 py-2">
                                <Tabs.List
                                    class="flex flex-row w-full gap-2 justify-start bg-transparent mx-0 px-0"
                                >
                                    {#each Object.entries(tabs) as [key, icon]}
                                        <Tabs.Trigger
                                            class="px-0 mx-0"
                                            disabled={loading}
                                            value={key}
                                        >
                                            <Button
                                                disabled={loading}
                                                class="capitalize"
                                                variant="outline"
                                            >
                                                <svelte:component this={icon} />
                                                {key}
                                            </Button>
                                        </Tabs.Trigger>
                                    {/each}
                                </Tabs.List>
                            </div>
                            <slot />
                        </Tabs.Root>
                    {/if}
                    {#if list || !tabs}
                        <div class="flex flex-col gap-3 p-3">
                            <slot />
                        </div>
                    {/if}
                {:else}
                    <div class="p-5" class:py-16={!small}>
                        <Empty type={name} {action} {small}>
                            <slot name="add" />
                        </Empty>
                    </div>
                {/if}
            </Card.Root>
        {/if}
    </div>
{/if}
