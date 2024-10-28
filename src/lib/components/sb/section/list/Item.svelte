<script lang="ts">
    import * as Table from "$lib/components/ui/table/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { EllipsisVertical, Loader2 } from "lucide-svelte";
    import { createEventDispatcher } from "svelte";
    export let name: string | null = null,
        loading: boolean = false,
        slim = false;
    const SLOTS = $$props.$$slots;

    const dispatch = createEventDispatcher();
</script>

<Table.Row
    on:click={() => dispatch("click")}
    class={`flex flex-row gap-5 items-center ${slim ? "p-3" : " px-5 py-4"}`}
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
</Table.Row>
