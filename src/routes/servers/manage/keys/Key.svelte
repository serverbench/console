<script lang="ts">
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import { Copy, Loader2 } from "lucide-svelte";
    export let key: string | null;
    export let secret: boolean = false;
</script>

<Item>
    <p class="w-1/2 md:w-1/6">
        {#if secret}
            Secret Key
        {:else}
            Public Key
        {/if}
    </p>
    <Input type={secret ? "password" : "text"} value={key} disabled />
    <Button
        disabled={!key}
        on:click={() => (key ? navigator.clipboard.writeText(key) : null)}
    >
        {#if key}
            <Copy />
        {:else}
            <Loader2 class="animate-spin" />
        {/if}
    </Button>
</Item>
