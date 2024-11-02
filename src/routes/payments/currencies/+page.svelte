<script lang="ts">
    import Section from "$lib/components/sb/section/section.svelte";
    import CountryCurrency from "$lib/sb/store/CountryCurrency";
    import { onMount } from "svelte";
    import CurrencyRow from "./CurrencyRow.svelte";
    import CountryPicker from "$lib/components/sb/picker/CountryPicker.svelte";
    import CurrencyPicker from "$lib/components/sb/picker/CurrencyPicker.svelte";
    import Button from "$lib/components/ui/button/button.svelte";

    let loading = true;
    let adding = false;
    let currencies: CountryCurrency[] = [];

    let country: string | null;
    let currency: string | null;

    onMount(async () => {
        loading = true;
        try {
            currencies = await CountryCurrency.list();
        } catch (error) {}
        loading = false;
    });

    async function add() {
        adding = true;
        try {
            const newCurrency = await CountryCurrency.set(country!, currency!);
            currencies = [...currencies, newCurrency];
            currency = null;
            country = null;
        } catch (error) {}
        adding = false;
    }
</script>

<Section name="currencies" {loading} list used={currencies.length}>
    <div slot="add" class="flex flex-col gap-2">
        <CountryPicker
            disabled={adding}
            bind:value={country}
            optional={false}
        />
        <CurrencyPicker disabled={adding} bind:value={currency} />
        <Button on:click={() => add()} disabled={adding}>Add</Button>
    </div>
    {#each currencies as currency}
        <CurrencyRow bind:currency bind:currencies />
    {/each}
</Section>
