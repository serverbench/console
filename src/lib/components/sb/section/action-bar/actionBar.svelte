<script lang="ts">
    import Limit from "./limit.svelte";
    import * as Popover from "$lib/components/ui/popover/";
    import Button from "../../../ui/button/button.svelte";
    import { Plus } from "lucide-svelte";

    export let limit: number = 0,
        used: number | null = 0,
        action = true;
</script>

<div class="flex flex-row items-center justify-between">
    {#if action}
        <Popover.Root portal={document.body}>
            <Popover.Trigger asChild let:builder>
                <Button
                    variant="outline"
                    builders={[builder]}
                    class="rounded-full"
                >
                    <Plus />
                    Create
                </Button>
            </Popover.Trigger>
            <Popover.Content class="w-80">
                <slot />
            </Popover.Content>
        </Popover.Root>
    {:else}
        <div class="grow" />
    {/if}
    {#if used != null && limit > 0}
        <Limit {used} max={limit} />
    {/if}
</div>
