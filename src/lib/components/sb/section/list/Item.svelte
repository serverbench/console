<script lang="ts">
    import * as Table from "$lib/components/ui/table/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { EllipsisVertical, Loader2 } from "lucide-svelte";
    import * as Card from "$lib/components/ui/card/index.js";
    import { createEventDispatcher } from "svelte";
    export let name: string | null = null,
        loading: boolean = false,
        slim = false;
    const SLOTS = $$props.$$slots;

    const dispatch = createEventDispatcher();
</script>

<Table.Row class="flex flex-col gap-4">
    <button
        class:p-3={slim}
        class:px-5={!slim}
        class:pt-4={!slim}
        class:pb-4={!slim && !SLOTS.extra}
        class="flex flex-row gap-5 items-center text-left"
        on:click={() => dispatch("click")}
    >
        <slot />
        {#if SLOTS.dropdown}
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                    <Button
                        builders={[builder]}
                        size="icon"
                        variant="secondary"
                        class="rounded-full"
                        disabled={loading}
                    >
                        {#if loading}
                            <Loader2 class="animate-spin" />
                        {:else}
                            <EllipsisVertical />
                        {/if}
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content class="w-56 flex flex-col">
                    {#if name}
                        <DropdownMenu.Label>{name}</DropdownMenu.Label>
                        <DropdownMenu.Separator />
                    {/if}
                    <slot name="dropdown" />
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        {/if}
    </button>
    {#if SLOTS.extra}
        <div class="pb-4 px-5">
            <slot name="extra" />
        </div>
    {/if}
</Table.Row>
