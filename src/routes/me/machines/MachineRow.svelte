<script lang="ts">
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import type Machine from "$lib/sb/machine/Machine";
    import * as Dialog from "$lib/components/ui/dialog";
    import DropdownItem from "$lib/components/sb/section/list/DropdownItem.svelte";
    import { Wrench } from "lucide-svelte";
    import { onMount } from "svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import { readonly } from "svelte/store";

    export let machine: Machine,
        setup = false;
    let sk: string | null = null;
    async function loadKeys() {
        if (!setup) return;
        const keys = await machine.getKeys();
        sk = keys.sk;
    }
    $: setup, loadKeys();

    onMount(() => loadKeys());
</script>

<Dialog.Root bind:open={setup}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Setup</Dialog.Title>
            <Dialog.Description>
                <Textarea
                    value="curl -fsSL https://get.serverbench.io | sh -s -- "{sk}""
                    readonly
                />
            </Dialog.Description>
        </Dialog.Header>
    </Dialog.Content>
</Dialog.Root>

<Item>
    <div class="grow flex flex-row items-center gap-2">
        {#if machine.hardware}
            {machine.hardware.hostname}
        {:else}
            <span class="font-mono">
                {machine.id}
            </span>
            <Badge variant="outline">Pending Setup</Badge>
        {/if}
    </div>
    <div slot="dropdown">
        <DropdownItem on:click={() => (setup = true)}>
            <Wrench />
            Setup
        </DropdownItem>
    </div>
</Item>
