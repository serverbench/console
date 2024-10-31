<script lang="ts">
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import Price from "../category/Price.svelte";
    import CountryCurrency from "$lib/sb/store/CountryCurrency";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import DropdownItem from "$lib/components/sb/section/list/DropdownItem.svelte";
    import { Repeat1, Repeat, Trash2, Pencil } from "lucide-svelte/icons";
    import type SkuPrice from "$lib/sb/store/sku/SkuPrice";
    import { createEventDispatcher } from "svelte";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import FrequencyPicker from "$lib/components/sb/picker/FrequencyPicker.svelte";
    import CountryPicker from "$lib/components/sb/picker/CountryPicker.svelte";
    import type { Frequency } from "$lib/sb/store/sku/SkuPrice";

    const dispatch = createEventDispatcher();

    export let price: SkuPrice;
    export let currencies: CountryCurrency[];
    $: currency =
        currencies.find((c) => c.country == price.country) ??
        currencies.find((c) => !c.country);
    let loading = false;

    let editing = false;

    let amount: number | null = null;
    let country: string | null = null;
    let frequency: string | null = null;

    async function deletePricing() {
        loading = true;
        try {
            await price.delete();
            dispatch("delete");
        } catch (error) {}
        loading = false;
    }

    async function updatePricing() {
        loading = true;
        try {
            price = await price.update(
                amount! * 10 ** currency!.digits,
                frequency as Frequency | null,
                country,
            );
            editing = false;
        } catch (error) {}
        loading = false;
    }

    function openEdit() {
        editing = true;
        amount = price.amount / 10 ** currency!.digits;
        country = price.country;
        frequency = price.frequency;
    }
</script>

<Dialog.Root bind:open={editing}>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title
                >Edit {price.country ?? "Default"} Pricing</Dialog.Title
            >
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <CountryPicker disabled={loading} bind:value={country} />
            <FrequencyPicker disabled={loading} bind:value={frequency} />
            <Input
                disabled={loading}
                type="number"
                bind:value={amount}
                placeholder="Amount"
            />
        </div>
        <Dialog.Footer>
            <Button
                on:click={() => updatePricing()}
                disabled={loading}
                type="submit">Save changes</Button
            >
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<Item>
    <div class="grow">
        <Price showImage={false} {price} {currencies} />
    </div>
    <div class="w-1/4 grid grid-cols-2 text-center">
        <div>
            <Badge>
                <div class="flex flex-row gap-2">
                    {#if price.frequency}
                        <Repeat />
                        {price.frequency}
                    {:else}
                        <Repeat1 />
                        One-Time
                    {/if}
                </div>
            </Badge>
        </div>
        <div>
            <Badge>
                {#if price.country}
                    <Price
                        showImage={true}
                        showText={false}
                        {price}
                        {currencies}
                    />
                {:else}
                    Global
                {/if}
            </Badge>
        </div>
    </div>
    <div slot="dropdown">
        <DropdownItem on:click={() => openEdit()}>
            <Pencil />
            Edit
        </DropdownItem>
        <DropdownItem on:click={() => deletePricing()} destructive>
            <Trash2 />
            Delete
        </DropdownItem>
    </div>
</Item>
