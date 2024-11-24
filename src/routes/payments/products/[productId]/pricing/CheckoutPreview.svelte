<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import type SkuPrice from "$lib/sb/store/sku/SkuPrice";
    import User from "$lib/sb/User";
    import { Loader2 } from "lucide-svelte";
    import { onMount } from "svelte";
    import MemberPicker from "../../../../community/members/MemberPicker.svelte";
    import type Member from "$lib/sb/member/Member";

    let user: User | null = null;
    let member: Member | null = null;
    onMount(async () => {
        user = await User.get();
    });
    export let price: SkuPrice,
        open = false;

    let src: string | null = null;
    let loading = false;

    async function load() {
        loading = true;
        try {
            const checkout = await price.checkoutPreview(member!);
            src =
                `https://safe.serverbench.io/checkout?token=${checkout.checkout.token}` +
                (localStorage.getItem("dark") ? "&dark" : "");
        } catch (error) {}
        loading = false;
    }

    $: open,
        (() => {
            src = null;
        })();
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="overflow-hidden max-w-screen-sm">
        <div
            class:h-96={src}
            class="overflow-y-auto flex flex-col items-center justify-center"
        >
            {#if loading}
                <Loader2 class="animate-spin" />
            {:else if !src}
                <MemberPicker bind:member />
            {:else}
                <iframe
                    class="block h-full w-full"
                    title="checkout preview"
                    {src}
                />
            {/if}
        </div>
        <Dialog.Footer>
            {#if src}
                <Button
                    variant="secondary"
                    href={`${src}&popup&background`}
                    target="_blank">Open</Button
                >
            {/if}
            <Button type="submit" on:click={() => (open = false)}>Done</Button>
            {#if !src}
                <Button on:click={() => load()} disabled={loading}>Next</Button>
            {/if}
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
