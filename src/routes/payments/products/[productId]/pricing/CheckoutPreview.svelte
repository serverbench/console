<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import type SkuPrice from "$lib/sb/store/sku/SkuPrice";
    import User from "$lib/sb/User";
    import { Loader2 } from "lucide-svelte";
    import { onMount } from "svelte";

    let user: User | null = null;
    onMount(async () => {
        user = await User.get();
    });
    export let price: SkuPrice,
        open = false;

    let src: string | null = null;

    $: open,
        (async () => {
            if (!src) {
                const checkout = await price.checkoutPreview();
                src =
                    `https://safe.serverbench.io/checkout?token=${checkout.checkout.token}` +
                    (localStorage.getItem("dark") ? "&dark" : "");
            }
        })();
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="overflow-hidden max-w-screen-sm">
        <div
            class="overflow-y-auto h-96 flex flex-col items-center justify-center"
        >
            {#if price.sku.category && open && user && src}
                <iframe
                    class="block h-full w-full"
                    title="checkout preview"
                    {src}
                />
            {:else}
                <Loader2 class="animate-spin" />
            {/if}
        </div>
        <Dialog.Footer>
            {#if src}
                <Button variant="secondary" href={`${src}&popup&background`} target="_blank">Open</Button>
            {/if}
            <Button type="submit" on:click={() => (open = false)}>Done</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
