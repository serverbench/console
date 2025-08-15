<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
    import type ExchangeRate from "$lib/sb/wallet/ExchangeRate";
    import type Wallet from "$lib/sb/wallet/Wallet";
    import NumberFlow from "@number-flow/svelte";
    import Amount from "./Amount.svelte";
    import type Currency from "$lib/sb/store/Currency";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import { blur } from "svelte/transition";
    export let currency: Currency | null;
    export let amounts:
        | {
              currency: Currency;
              amount: number;
          }[]
        | number = [];
    export let previousAmounts:
        | {
              currency: Currency;
              amount: number;
          }[]
        | number
        | null = null;
    export let exchangeRate: ExchangeRate | null;

    let total: number | null = null;
    let previous: number | null = null;
    let compare: string | null = null;
    let comparePositive: boolean | null = null;
    let usedExchange = false;

    function computeMain() {
        total = computeTotal(amounts);
        if (previousAmounts != null && total != null) {
            previous = computeTotal(previousAmounts);
            if (previous == 0) {
                if (total < 0) {
                    compare = "-∞";
                    comparePositive = false;
                } else if (total > 0) {
                    compare = "+∞";
                    comparePositive = true;
                } else {
                    compare = "—";
                }
            } else if (previous != null) {
                compare = ((total - previous) / previous).toLocaleString(
                    "en-US",
                    {
                        style: "percent",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    },
                );
                if (total == previous) {
                    compare = "—";
                    comparePositive = null;
                } else if (total < previous) {
                    comparePositive = false;
                } else if (total > previous) {
                    comparePositive = true;
                    compare = `+${compare}`;
                }
            }
        }
    }

    function computeTotal(
        amounts:
            | {
                  currency: Currency;
                  amount: number;
              }[]
            | number,
    ) {
        usedExchange = false;
        let tmpTotal: number | null = null;
        if (typeof amounts === "number") {
            tmpTotal = amounts;
            return tmpTotal;
        }
        if (!currency) {
            tmpTotal = null;
        } else if (exchangeRate) {
            tmpTotal = 0;
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
                tmpTotal += Math.trunc(w.amount / realExchangeRate);
            }
        } else {
            tmpTotal = currency
                ? (amounts.find((c) => c.currency.code == currency.code)
                      ?.amount ?? null)
                : null;
        }
        return tmpTotal;
    }

    $: currency, computeMain();
    $: exchangeRate, computeMain();
</script>

<Card.Root class="p-5 relative flex flex-col gap-5">
    <div class="font-semibold flex flex-row gap-2 items-center">
        <slot />
        {#if compare != null}
            <div transition:blur>
                <Badge
                    class={comparePositive == true
                        ? "text-emerald-900 bg-emerald-200 dark:text-emerald-100 dark:bg-emerald-900"
                        : comparePositive == false
                          ? "text-red-900 bg-red-200 dark:text-red-100 dark:bg-red-900"
                          : "text-gray-900 bg-gray-200 dark:text-gray-100 dark:bg-gray-900"}
                >
                    {compare}
                </Badge>
            </div>
        {/if}
    </div>
    <div class="w-full grow">
        {#if currency == null || total == null}
            <Skeleton class="w-full h-24" />
        {:else}
            <div class="h-24 items-center text-5xl flex flex-row gap-2">
                <NumberFlow
                    value={total /
                        (typeof amounts != "number"
                            ? 10 ** currency.digits
                            : 1)}
                    format={typeof amounts != "number"
                        ? {
                              style: "currency",
                              currency: currency.code,
                          }
                        : undefined}
                />
            </div>
        {/if}
    </div>
    <div class="text-xs leading-6">
        <slot name="note" />
        {#if usedExchange && exchangeRate && typeof amounts !== "number"}
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
