<script lang="ts">
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import CountryCurrency from "$lib/sb/store/CountryCurrency";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import DropdownItem from "$lib/components/sb/section/list/DropdownItem.svelte";
    import {
        Repeat1,
        Repeat,
        Trash2,
        Pencil,
        ShoppingCart,
    } from "lucide-svelte/icons";
    import type SkuPrice from "$lib/sb/store/sku/SkuPrice";
    import { createEventDispatcher, onMount } from "svelte";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import FrequencyPicker from "$lib/components/sb/picker/FrequencyPicker.svelte";
    import CountryPicker from "$lib/components/sb/picker/CountryPicker.svelte";
    import type { Frequency } from "$lib/sb/store/sku/SkuPrice";
    import Price from "../../category/Price.svelte";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import CheckoutPreview from "./CheckoutPreview.svelte";

    const dispatch = createEventDispatcher();

    export let virtual = false;
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
            const amountInMinorUnits = Math.round(amount! * 10 ** currency!.digits);
            if (virtual) {
                price = await price.sku.addPricing(
                    amountInMinorUnits,
                    frequency as Frequency | null,
                    country,
                );
                virtual = false;
            } else {
                price = await price.update(
                    amountInMinorUnits,
                    frequency as Frequency | null,
                    country,
                );
            }
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

    let virtualHeadsup = false;
    let checkingOut = false;
</script>

<AlertDialog.Root bind:open={virtualHeadsup}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>
                This pricing cannot be deleted
            </AlertDialog.Title>
            <AlertDialog.Description>
                This pricing cannot be deleted, because it represents the global
                pricing in an specific country. You can edit it instead, or you
                can delete the country currency from the currency settings
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Action>Continue</AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<Dialog.Root bind:open={editing}>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title
                >Edit {price.country ?? "Default"} Pricing</Dialog.Title
            >
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <CountryPicker optional disabled={loading} bind:value={country} />
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

<CheckoutPreview {price} bind:open={checkingOut} />
<Item>
    <div class="grow">
        <Price showImage={false} {price} {currencies} />
    </div>
    <div class="w-1/2 lg:w-1/3 xl:w-1/4 grid grid-cols-2 text-center">
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
            <Badge variant="outline">
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
        <DropdownItem on:click={() => (checkingOut = true)}>
            <ShoppingCart />
            Checkout
        </DropdownItem>
        <DropdownItem on:click={() => openEdit()}>
            <Pencil />
            Edit
        </DropdownItem>
        <DropdownItem
            on:click={() =>
                virtual ? (virtualHeadsup = true) : deletePricing()}
            destructive
        >
            <Trash2 />
            Delete
        </DropdownItem>
    </div>
</Item>
