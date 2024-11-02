<script lang="ts">
    import Country from "$lib/components/sb/country.svelte";
    import CurrencyPicker from "$lib/components/sb/picker/CurrencyPicker.svelte";
    import DropdownItem from "$lib/components/sb/section/list/DropdownItem.svelte";
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import type CountryCurrency from "$lib/sb/store/CountryCurrency";
    import { Trash2, EllipsisVertical } from "lucide-svelte";
    import { tick } from "svelte";

    export let currency: CountryCurrency, currencies: CountryCurrency[];

    let curr = currency.currency;

    let loading = false;

    $: curr,
        (async () => {
            if (curr == currency.currency || loading) return;
            loading = true;
            try {
                currency = await currency.update(curr);
                await tick();
                if (currency.country == null) {
                    currencies = currencies.filter(
                        (c) => !c.country || c.currency != currency.currency,
                    );
                }
            } catch (error) {
                curr = currency.currency;
            }
            loading = false;
        })();

    async function removeCountry() {
        loading = true;
        try {
            await currency.remove();
            currencies = currencies.filter(
                (c) => c.country != currency.country,
            );
        } catch (error) {}
        loading = false;
    }
</script>

<Item {loading} hideDropdown={!currency.country}>
    <Country country={currency.country} fullName />
    <div class="ml-auto w-1/2 md:w-1/4 lg:w-1/6">
        <CurrencyPicker disabled={loading} bind:value={curr} />
    </div>
    {#if !currency.country}
        <Button
            size="icon"
            disabled
            class="rounded-full aspect-square"
            variant="secondary"
        >
            <EllipsisVertical />
        </Button>
    {/if}
    <div slot="dropdown">
        <DropdownItem on:click={() => removeCountry()} destructive>
            <Trash2 />
            Remove
        </DropdownItem>
    </div>
</Item>
