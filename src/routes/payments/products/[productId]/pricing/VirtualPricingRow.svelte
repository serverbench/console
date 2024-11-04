<script lang="ts">
    import type CountryCurrency from "$lib/sb/store/CountryCurrency";
    import SkuPrice from "$lib/sb/store/sku/SkuPrice";
    import PricingRow from "./PricingRow.svelte";
    export let origin: SkuPrice, country: string, currencies: CountryCurrency[];
</script>

<PricingRow
    price={new SkuPrice(
        origin.id,
        origin.sku,
        origin.amount,
        origin.frequency,
        country,
    )}
    {currencies}
    virtual
/>
