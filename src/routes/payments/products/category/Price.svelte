<script lang="ts">
    import type CountryCurrency from "$lib/sb/store/CountryCurrency";
    import type SkuPrice from "$lib/sb/store/sku/SkuPrice";
    import { Loader2 } from "lucide-svelte";

    export let currencies: CountryCurrency[] = [];
    export let price: SkuPrice;
    export let showImage = true;
    export let showText = true;

    $: defaultCurrency = currencies.find((c) => !c.country);
    $: currency =
        currencies.find((c) => c.country == price.country) ?? defaultCurrency;
</script>

{#if showText}
    {#if !currency}
        <Loader2 class="animate-spin" />
    {:else}
        <span class="flex flex-row">
            <span>
                {(price.amount / 10 ** currency.digits).toFixed(currency.digits)}
                {currency.currency}
            </span>
            {#if price.frequency}
                <span> / </span>
                <span>
                    {price.frequency.substring(0, 1).toUpperCase()}
                </span>
            {/if}
        </span>
    {/if}
{/if}
{#if showImage && price.country}
    <img
        class="h-4"
        src={`https://flagcdn.com/${price.country.toLowerCase()}.svg`}
        alt={`${price.country} flag`}
    />
{/if}
