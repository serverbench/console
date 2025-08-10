<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import { Check, Cross, Loader2, Pause, X } from "lucide-svelte";
    import { createEventDispatcher } from "svelte";
    export let show: boolean, connected: boolean | null;
    const dispatch = createEventDispatcher();
</script>

<Button
    on:click={() => {
        show = !show;
        dispatch("change", { show });
    }}
    disabled={connected == null}
    class="flex flex-row gap-2 items-center"
    variant={connected === null
        ? "secondary"
        : show
          ? undefined
          : "destructive"}
>
    <slot />
    {#if connected === null}
        <Loader2 class="animate-spin" />
    {:else if connected}
        {#if show}
            <Check />
        {:else}
            <Pause />
        {/if}
    {:else}
        <X />
    {/if}
</Button>
