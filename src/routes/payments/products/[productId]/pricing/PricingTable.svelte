<script lang="ts">
    import type Sku from "$lib/sb/store/sku/Sku";
    import Button from "$lib/components/ui/button/button.svelte";
    import Section from "$lib/components/sb/section/section.svelte";
    import CountryCurrency from "$lib/sb/store/CountryCurrency";
    import PricingRow from "./PricingRow.svelte";
    import CountryPicker from "$lib/components/sb/picker/CountryPicker.svelte";
    import FrequencyPicker from "$lib/components/sb/picker/FrequencyPicker.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import type { Frequency } from "$lib/sb/store/sku/SkuPrice";
    import { onMount } from "svelte";

    export let product: Sku | null = null;
    let currencies: CountryCurrency[] = [];
    let loading = false;

    onMount(async () => {
        loading = true;
        currencies = await CountryCurrency.list();
        loading = false;
    });

    $: currency =
        currencies.find((c) => c.country == country) ??
        currencies.find((c) => !c.country);

    let country: string | null = null;
    let frequency: string | null = null;
    let amount: number | null = null;

    async function addPrice() {
        try {
            product = (
                await product!.addPricing(
                    amount! * 10 ** currency!.digits,
                    frequency as Frequency | null,
                    country,
                )
            ).sku;
            amount = null;
            frequency = null;
            country = null;
        } catch (error) {}
    }
</script>

<Section
    hideName
    used={product?.prices.length ?? 0}
    name="Prices"
    list
    {loading}
>
    <div class="flex flex-col gap-2" slot="add">
        <CountryPicker optional={true} disabled={loading} bind:value={country} />
        <FrequencyPicker disabled={loading} bind:value={frequency} />
        <Input disabled={loading} bind:value={amount} type="number" min={0} />
        <Button on:click={() => addPrice()} disabled={loading}>
            Add Price
        </Button>
    </div>
    {#each product?.prices ?? [] as price}
        <PricingRow
            on:delete={() => {
                if (!product) return;
                product.prices = product.prices.filter((p) => p.id != price.id);
            }}
            {currencies}
            {price}
        />
    {/each}
</Section>
