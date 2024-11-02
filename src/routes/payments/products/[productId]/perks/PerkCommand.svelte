<script lang="ts">
    import CommandTriggerPicker from "$lib/components/sb/picker/CommandTriggerPicker.svelte";
    import DropdownItem from "$lib/components/sb/section/list/DropdownItem.svelte";

    import Item from "$lib/components/sb/section/list/Item.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import type PerkCmd from "$lib/sb/store/sku/perk/PerkCmd";
    import type SkuPerkUsage from "$lib/sb/store/sku/perk/SkuPerkUsage";
    import { Save, Trash2, RotateCcw } from "lucide-svelte";

    export let cmd: PerkCmd, perk: SkuPerkUsage;

    let trigger = cmd.trigger;
    let cmdValue = cmd.cmd;

    $: modified = trigger != cmd.trigger || cmdValue != cmd.cmd;

    let loading = false;

    async function removeCmd() {
        loading = true;
        try {
            await cmd.remove();
            perk = perk;
        } catch (error) {}
        loading = false;
    }

    async function updateCmd() {
        loading = true;
        try {
            await cmd.update(trigger, cmdValue);
            perk = perk
            trigger = cmd.trigger;
            cmdValue = cmd.cmd;
        } catch (error) {}
        loading = false;
    }
</script>

<Item hideDropdown={modified}>
    <div class="w-1/3">
        <CommandTriggerPicker disabled={loading} bind:value={trigger} />
    </div>
    <Input
        disabled={loading}
        bind:value={cmdValue}
        class="grow"
        placeholder="cmd"
    />
    {#if modified}
        <Button
            disabled={loading}
            on:click={() => {
                trigger = cmd.trigger;
                cmdValue = cmd.cmd;
            }}
            variant="outline"
            size="icon"
            class="rounded-full aspect-square"
        >
            <RotateCcw />
        </Button>
        <Button
            disabled={loading}
            size="icon"
            class="rounded-full aspect-square"
            on:click={() => updateCmd()}
        >
            <Save />
        </Button>
    {/if}
    <div slot="dropdown">
        <DropdownItem destructive on:click={() => removeCmd()}>
            <Trash2 />
            Delete
        </DropdownItem>
    </div>
</Item>
