<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
    import type ExchangeRate from "$lib/sb/wallet/ExchangeRate";
    import type Wallet from "$lib/sb/wallet/Wallet";
    import Amount from "./Amount.svelte";
    export let amount: "withdrawable" | "settling" | "credit";
    export let wallet: Wallet | null;
    export let wallets: Wallet[] = [];
    export let exchangeRate: ExchangeRate | null;

    function getAmount(
        wallet: Wallet,
        amount: "withdrawable" | "settling" | "credit",
    ) {
        switch (amount) {
            case "withdrawable":
                return wallet.withdrawable;
            case "settling":
                return wallet.settling;
            case "credit":
                return wallet.credit;
        }
    }

    let total: number | null = null;
    let usedExchange = false;
    computeTotal();
    function computeTotal() {
        usedExchange = false;
        if (!wallet) {
            total = null;
        } else if (exchangeRate) {
            total = 0;
            for (const w of wallets) {
                let realExchangeRate = 0;
                if (exchangeRate.base == w.currency.code) {
                    realExchangeRate = 1;
                } else {
                    usedExchange = true;
                    // 1. origin to 'base'
                    realExchangeRate = exchangeRate.rates.get(w.currency.code)!;
                    // 2. base to 'target'
                    if (wallet.currency.code != exchangeRate.base) {
                        realExchangeRate *= exchangeRate.rates.get(
                            wallet.currency.code,
                        )!;
                    }
                }
                total += Math.trunc(getAmount(w, amount) * realExchangeRate);
            }
        } else {
            total = wallet ? getAmount(wallet, amount) : null;
        }
    }

    $: wallet, computeTotal();
    $: exchangeRate, computeTotal();
</script>

<Card.Root class="p-5 relative">
    <p class="font-semibold">
        <slot />
    </p>
    <div class="w-full py-5">
        {#if amount == null || wallet == null || total == null}
            <Skeleton class="w-full h-24" />
        {:else}
            <div class="h-24 flex flex-col justify-center text-5xl">
                <Amount amount={total} currency={wallet?.currency} />
            </div>
        {/if}
    </div>
    <slot name="note" class="absolute bottom-0 p-5" />
    {#if usedExchange}
        <p class="absolute bottom-0 p-5">
            Exchange rate last updated at {exchangeRate?.created.toLocaleString()}.
            Includes:
            {#each wallets as w, i}
                <Amount amount={getAmount(w, amount)} currency={w.currency} />
                {i == wallets.length - 1 ? "" : ", "}
            {/each}
        </p>
    {/if}
</Card.Root>
