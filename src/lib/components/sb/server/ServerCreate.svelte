<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Server from "$lib/sb/server/Server";
    import { Loader2, Plus } from "lucide-svelte";
    import { createEventDispatcher } from "svelte";
    import Keydown from "svelte-keydown";
    const dispatch = createEventDispatcher();
    let value: string | null;
    let loading = false;

    async function create() {
        loading = true;
        try {
            dispatch("create", await Server.create(value!));
            value = null;
        } catch (error) {}
        loading = false;
    }
</script>

<div class="flex flex-row gap-3 items-center">
    <Input bind:value disabled={loading} placeholder="server-name" />
    <Button
        class="aspect-square"
        disabled={loading}
        on:click={() => create()}
        size="icon"
    >
        {#if loading}
            <Loader2 class="animate-spin" />
        {:else}
            <Plus />
        {/if}
    </Button>
</div>
