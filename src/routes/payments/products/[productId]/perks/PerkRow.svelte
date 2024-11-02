<script lang="ts">
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import DropdownItem from "$lib/components/sb/section/list/DropdownItem.svelte";
    import { Trash2, Loader2 } from "lucide-svelte";
    import type SkuPerkUsage from "$lib/sb/store/sku/perk/SkuPerkUsage";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import List from "$lib/components/sb/section/list/list.svelte";
    import type Sku from "$lib/sb/store/sku/Sku";
    import type SkuPerk from "$lib/sb/store/sku/perk/SkuPerk";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import Input from "$lib/components/ui/input/input.svelte";
    import PerkCommands from "./PerkCommands.svelte";
    import { tick } from "svelte";

    export let perk: SkuPerkUsage;
    export let perks: SkuPerk[];
    export let product: Sku;

    let removingEntirePerk = false;
    let removingPerk = false;

    let updatingAmount = false;
    let amount = perk.amount;
    async function update() {
        loading = true;
        try {
            await perk.update(amount);
            updatingAmount = false;
            perk = perk;
        } catch (error) {}
        loading = false;
    }

    let loading = false;
    let usages: SkuPerkUsage[] = [];

    $: removingPerk,
        (async () => {
            if (removingPerk) {
                loading = true;
                usages = await perk.perk.listUsages();
                loading = false;
            }
        })();

    async function removeEntirePerk() {
        loading = true;
        try {
            await perk.perk.delete();
            removingEntirePerk = false;
            removingPerk = false;
            product.perks = product.perks.filter(
                (p) => p.perk.id != perk.perk.id,
            );
            await tick();
            product = product;
            if (usages.length <= 1) {
                await tick();
                perks = perks.filter((p) => p.id != perk.perk.id);
            }
        } catch (error) {}
        loading = false;
    }

    async function removePerkLocally() {
        loading = true;
        try {
            await perk.unuse();
            removingPerk = false;
            removingEntirePerk = false;
            await tick();
            product = product;
            if (usages.length <= 1) {
                await tick();
                perks = perks.filter((p) => p.id != perk.perk.id);
            }
        } catch (error) {}
        loading = false;
    }
</script>

<AlertDialog.Root bind:open={removingPerk}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title
                >Are you absolutely sure you want to remove {perk.perk
                    .name}?</AlertDialog.Title
            >
            <AlertDialog.Description>
                The perk will be removed from this product.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel disabled={loading}>Cancel</AlertDialog.Cancel>
            {#if loading || usages.length > 1}
                <AlertDialog.Action
                    class="destructive"
                    on:click={() => (removingEntirePerk = true)}
                >
                    Remove Perk Globally
                </AlertDialog.Action>
            {/if}
            <AlertDialog.Action
                class="destructive"
                on:click={() => removePerkLocally()}
                disabled={loading}>Remove Perk</AlertDialog.Action
            >
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<AlertDialog.Root bind:open={removingEntirePerk}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>
                Are you absolutely sure you want to remove the perk on all
                products?
            </AlertDialog.Title>
            <AlertDialog.Description class="flex flex-col gap-2">
                {#if loading || usages.length > 1}
                    <div>
                        <span> This perk is used on </span>
                        {#if loading}
                            <Loader2 class="animate-spin inline" />
                        {:else}
                            {usages.length - 1}
                        {/if}
                        <span>
                            other product{usages.length == 2 ? "" : "s"}.
                            Deleting it will remove it from all of them.
                        </span>
                    </div>
                    {#if !loading}
                        <List>
                            {#each usages as usage}
                                <Item>
                                    <span>{usage.sku.name}</span>
                                </Item>
                            {/each}
                        </List>
                    {/if}
                {:else}
                    <span> This perk is only used on this product. </span>
                {/if}
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel disabled={loading}>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action
                class="destructive"
                on:click={() => removeEntirePerk()}
                disabled={loading}>Remove Perk Everywhere</AlertDialog.Action
            >
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<Item>
    <Popover.Root bind:open={updatingAmount}>
        <Popover.Trigger>
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <Button variant="outline" class="w-16">
                        {#if perk.amount == null}
                            N/A
                        {:else}
                            {perk.amount}
                        {/if}
                    </Button>
                </Tooltip.Trigger>
                <Tooltip.Content class="w-60">
                    {#if perk.amount == null}
                        No amount set. If this is supposed to be a countable
                        perk, click here to set the amount.
                    {:else}
                        Click here to change (or remove) the amount.
                    {/if}
                </Tooltip.Content>
            </Tooltip.Root>
        </Popover.Trigger>
        <Popover.Content class="flex flex-col gap-2">
            <Input bind:value={amount} placeholder="amount" />
            <div class="flex flex-row items-center gap-2">
                {#if perk.amount != null}
                    <Button
                        on:click={async () => {
                            amount = null;
                            await update();
                        }}
                        disabled={loading}
                        class="destructive grow"
                        variant="ghost">Remove Amount</Button
                    >
                {:else}
                    <div class="grow" />
                {/if}
                <Button on:click={() => update()} disabled={loading}
                    >Update</Button
                >
            </div>
        </Popover.Content>
    </Popover.Root>
    <span class="grow">
        {perk.perk.name}
    </span>
    <PerkCommands bind:perk />
    <div slot="dropdown">
        <DropdownItem destructive on:click={() => (removingPerk = true)}>
            <Trash2 />
            <span>Delete</span>
        </DropdownItem>
    </div>
</Item>
