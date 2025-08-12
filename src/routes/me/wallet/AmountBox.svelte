<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
    import type ExchangeRate from "$lib/sb/wallet/ExchangeRate";
    import type Wallet from "$lib/sb/wallet/Wallet";
    import NumberFlow from "@number-flow/svelte";
    import Amount from "./Amount.svelte";
    import type Currency from "$lib/sb/store/Currency";
    export let currency: Currency | null;
    export let amounts: {
        currency: Currency;
        amount: number;
    }[] = [];
    export let exchangeRate: ExchangeRate | null;

    let total: number | null = null;
    let usedExchange = false;
    computeTotal();
    function computeTotal() {
        usedExchange = false;
        if (!currency) {
            total = null;
        } else if (exchangeRate) {
            total = 0;
            for (const w of amounts) {
                let realExchangeRate = 0;
                if (exchangeRate.base == w.currency.code) {
                    realExchangeRate = 1;
                } else {
                    usedExchange = true;
                    // 1. origin to 'base'
                    realExchangeRate = exchangeRate.rates.get(w.currency.code)!;
                    // 2. base to 'target'
                    if (currency.code != exchangeRate.base) {
                        realExchangeRate *= exchangeRate.rates.get(
                            currency.code,
                        )!;
                    }
                }
                total += Math.trunc(w.amount * realExchangeRate);
            }
        } else {
            total = currency
                ? (amounts.find((c) => c.currency.code == currency.code)
                      ?.amount ?? null)
                : null;
        }
    }

    $: currency, computeTotal();
    $: exchangeRate, computeTotal();
</script>

<Card.Root class="p-5 relative flex flex-col gap-5">
    <div class="font-semibold flex flex-row gap-2 items-center">
        <slot />
    </div>
    <div class="w-full grow">
        {#if currency == null || total == null}
            <Skeleton class="w-full h-24" />
        {:else}
            <div class="h-24 flex flex-col justify-center text-5xl">
                <NumberFlow
                    value={total / 10 ** currency.digits}
                    format={{
                        style: "currency",
                        currency: currency.code,
                    }}
                />
            </div>
        {/if}
    </div>
    <div class="text-xs leading-6">
        <slot name="note" />
        {#if usedExchange && exchangeRate}
            <div class="text-opacity-80 hover:text-opacity-100 transition">
                Exchange rate last updated at {exchangeRate?.created.toLocaleTimeString()}.
                Includes:
                {#each amounts as w, i}
                    <Amount amount={w.amount} currency={w.currency} />
                    {i == amounts.length - 1 ? "" : ", "}
                {/each}
            </div>
        {/if}
    </div>
</Card.Root>
