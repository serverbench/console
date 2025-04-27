<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import type SkuPrice from "$lib/sb/store/sku/SkuPrice";
    import User from "$lib/sb/User";
    import { Loader2 } from "lucide-svelte";
    import { onMount } from "svelte";
    import MemberPicker from "../../../../community/members/MemberPicker.svelte";
    import type Member from "$lib/sb/member/Member";
    import Community from "$lib/sb/Community";
    import Serverbench from "@serverbench/js";
    import { goto } from "$app/navigation";
    import { toast } from "svelte-sonner";

    let user: User | null = null;
    let member: Member | null = null;
    onMount(async () => {
        user = await User.get();
    });
    export let price: SkuPrice,
        open = false;

    let loading = false;
    let mounted = false;
    let mountTarget: HTMLDivElement | null = null;

    async function load() {
        loading = true;
        try {
            const community = await Community.get();
            const keys = await community!.getKeys();
            const serverbench = Serverbench.get(
                community!.id,
                keys.pk,
                (await User.get())!.isTest(),
            );
            const m = await serverbench.store
                .checkout([price!.id], [], member!.id, null)
                .setDark(localStorage.getItem("dark") ? true : false)
                .mount(mountTarget!);
            m.addEventListener("payment", () => {
                open = false;
                toast.success("Paid", {
                    description: "The checkout has been completed",
                });
                goto("/payments/transactions");
            });
            mounted = true;
        } catch (error) {}
        loading = false;
    }

    $: open,
        (() => {
            mounted = false;
            member = null;
            loading = false;
        })();
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="overflow-hidden max-w-screen-sm">
        <div class="overflow-y-auto flex flex-col items-center justify-center">
            <div
                class:hidden={!mounted}
                class="w-full"
                bind:this={mountTarget}
            ></div>
            {#if loading}
                <Loader2 class="animate-spin" />
            {:else if !mounted}
                <MemberPicker bind:member />
            {/if}
        </div>
        <Dialog.Footer>
            <Button type="submit" on:click={() => (open = false)}>Done</Button>
            {#if !mounted}
                <Button on:click={() => load()} disabled={loading || !member}
                    >Next</Button
                >
            {/if}
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
