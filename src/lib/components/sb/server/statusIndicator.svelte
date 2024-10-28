<script lang="ts">
    import type { state } from "$lib";
    import * as Tooltip from "$lib/components/ui/tooltip";
    export let status: state =
        "unknown";
</script>

<Tooltip.Root>
    <Tooltip.Trigger>
        <div
            class:bg-neutral-400={status == "unknown"}
            class:bg-green-400={status == "online"}
            class:bg-red-400={status == "offline"}
            class:bg-yellow-400={status == "partially-online"}
            class:animate-pulse={status != "unknown"}
            class="w-2 h-2 rounded-full"
        ></div>
    </Tooltip.Trigger>
    <Tooltip.Content>
        <p>
            {#if status == "offline"}
                Offline
            {:else if status == "online"}
                Fully Online
            {:else if status == "partially-online"}
                Partially Online
            {:else}
                Unknown Status
            {/if}
        </p>
    </Tooltip.Content>
</Tooltip.Root>
