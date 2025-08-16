<script lang="ts">
    import Section from "$lib/components/sb/section/section.svelte";
    import OwnershipImport from "./OwnershipImport.svelte";
    import { onMount } from "svelte";
    import Transaction from "$lib/sb/store/Transaction";
    import Amount from "../../me/wallet/Amount.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import { Gift, Package, RefreshCw } from "lucide-svelte";
    import Time from "svelte-time/Time.svelte";
    import * as Table from "$lib/components/ui/table";
    import { inview } from "svelte-inview";
    import { Skeleton } from "$lib/components/ui/skeleton";
    import type { ChargeAnalyticsGroup } from "$lib/sb/checkout/ChargeAnalytics";
    import Charge from "$lib/sb/checkout/Charge";
    import AmountBox from "../../me/wallet/AmountBox.svelte";
    import type Currency from "$lib/sb/store/Currency";
    import ExchangeRate from "$lib/sb/wallet/ExchangeRate";
    import moment from "moment";
    import SimplePicker from "$lib/components/sb/picker/SimplePicker.svelte";

    let transactions: Transaction[] = [];
    let analytics: ChargeAnalyticsGroup | null = null;
    let previousAnalytics: ChargeAnalyticsGroup | null = null;
    let exchangeRate: ExchangeRate | null = null;
    let hasMore = true;
    let page = 0;
    let loading = false;

    onMount(async () => {
        const now = moment();
        await loadMore();
    });

    async function loadAnalytics() {
        exchangeRate = null;
        previousAnalytics = null;
        analytics = null;
        const start = moment(period[0]);
        const end = moment();
        const previousStart = start.clone().subtract(period[1], period[2]);
        const previousEnd = end.clone().subtract(period[1], period[2]);
        console.log(
            "Loading analytics from",
            start.toISOString(),
            "to",
            end.toISOString(),
            "and previous from",
            previousStart.toISOString(),
            "to",
            previousEnd.toISOString(),
        );
        const [analyticsUpdate, prev, exchangeUpdate] = await Promise.all([
            Charge.getAnalytics(start.toDate(), end.toDate()),
            Charge.getAnalytics(previousStart.toDate(), previousEnd.toDate()),
            ExchangeRate.get(),
        ]);
        exchangeRate = exchangeUpdate;
        previousAnalytics = prev;
        analytics = analyticsUpdate;
    }

    async function loadMore() {
        if (loading || !hasMore) return;
        loading = true;
        try {
            const loaded = await Transaction.list(page);
            if (loaded.length < 20) {
                hasMore = false;
            }
            transactions = [...transactions, ...loaded];
            page++;
        } catch (error) {
            console.error("Error loading transactions:", error);
        } finally {
            loading = false;
        }
    }

    let currency: Currency = {
        code: "EUR",
        digits: 2,
    };

    const options: [any, string][] = [
        [[moment().startOf("month"), 1, "month"], "MTD (Month to Date)"],
        [[moment().startOf("quarter"), 1, "quarter"], "QTD (Quarter to Date)"],
        [[moment().startOf("year"), , 1, "year"], "YTD (Year to Date)"],
        [[moment().subtract(7, "days"), 7, "days"], "Last 7 Days"],
        [[moment().subtract(30, "days"), 30, "days"], "Last 30 Days"],
    ];

    let period = options[0][0];

    $: period, loadAnalytics();
</script>

<div class="w-64 ml-auto">
    <SimplePicker name="Period" bind:value={period} items={options} />
</div>

{#key analytics}
    <div class="grid md:grid-cols-3 grid-cols-1 gap-4">
        <AmountBox
            {currency}
            amounts={analytics?.amounts.map((a) => {
                return { currency: a.currency, amount: a.gross };
            })}
            previousAmounts={previousAnalytics?.amounts.map((a) => {
                return { currency: a.currency, amount: a.gross };
            })}
            {exchangeRate}
        >
            Gross
            <span slot="note"> Gross Income </span>
        </AmountBox>
        <AmountBox
            {currency}
            amounts={analytics?.amounts.map((a) => {
                return { currency: a.currency, amount: a.net };
            })}
            previousAmounts={previousAnalytics?.amounts.map((a) => {
                return { currency: a.currency, amount: a.net };
            })}
            {exchangeRate}
        >
            Net
            <span slot="note"> Net Income </span>
        </AmountBox>
        <AmountBox
            {currency}
            amounts={analytics?.count}
            previousAmounts={previousAnalytics?.count}
            {exchangeRate}
        >
            Count
            <span slot="note"> Payments </span>
        </AmountBox>
    </div>
{/key}

<Section
    name="Transactions"
    small
    used={loading && !transactions.length ? null : transactions.length}
>
    <Table.Root>
        <Table.Header>
            <Table.Row>
                <Table.Head>Created</Table.Head>
                <Table.Head>Package</Table.Head>
                <Table.Head>User</Table.Head>
                <Table.Head class="text-right">Amount</Table.Head>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {#each transactions as transaction}
                <Table.Row>
                    <Table.Cell>
                        <Badge class="whitespace-nowrap">
                            <Time
                                relative
                                timestamp={transaction.result?.created ??
                                    transaction.checkout.created}
                            />
                        </Badge>
                    </Table.Cell>
                    <Table.Cell>
                        {#each transaction.checkout.groups as group}
                            {#each group.lines as line}
                                <div
                                    class="bg-black dark:bg-white border border-opacity-10 bg-opacity-5 dark:bg-opacity-5 py-1 px-2 text-sm rounded flex-row gap-1 items-center inline-flex"
                                >
                                    {#if line.group.owner.id == transaction.checkout.member?.id}
                                        <Package />
                                    {:else}
                                        <Gift />
                                    {/if}
                                    {line.price.sku.name}
                                    {#if line.amount > 1}
                                        ({line.amount})
                                    {/if}
                                </div>
                            {/each}
                        {/each}
                    </Table.Cell>
                    <Table.Cell>
                        {#if transaction.checkout.member}
                            <div class="flex flex-col gap-1">
                                <p>{transaction.checkout.member.name}</p>
                                <p class="text-xs">
                                    {transaction.checkout.member
                                        .eid}@{transaction.checkout.member.game
                                        .slug}
                                </p>
                            </div>
                        {/if}
                    </Table.Cell>
                    <Table.Cell>
                        {#if transaction.result}
                            <div
                                class="group flex flex-row gap-2 items-center justify-end"
                            >
                                {#if transaction.result.subscription}
                                    <Badge variant="secondary">
                                        <RefreshCw />
                                    </Badge>
                                {/if}
                                <div class="block group-hover:hidden">
                                    <Amount
                                        color
                                        amount={transaction.result.amount}
                                        currency={transaction.result.currency}
                                    />
                                </div>
                                <div class="hidden group-hover:block">
                                    <Amount
                                        color
                                        amount={transaction.result.netAmount}
                                        currency={transaction.result.currency}
                                    />
                                </div>
                            </div>
                        {:else}
                            <div
                                class="flex flex-row gap-2 items-center justify-end"
                            >
                                <Badge variant="outline">Uncompleted</Badge>
                                {#if transaction.checkout.checkout}
                                    <Amount
                                        amount={transaction.checkout.checkout
                                            .upfront ??
                                            transaction.checkout.checkout
                                                ?.recurrent ??
                                            0}
                                        currency={transaction.checkout.checkout
                                            ?.currency}
                                    />
                                {:else}
                                    ?
                                {/if}
                            </div>
                        {/if}
                    </Table.Cell>
                </Table.Row>
            {/each}
            {#if loading}
                {#each Array(20) as _}
                    <Table.Row>
                        {#each Array(4) as _}
                            <Table.Cell>
                                <Skeleton class="h-[20px] my-2" />
                            </Table.Cell>
                        {/each}
                    </Table.Row>
                {/each}
            {:else}
                <div
                    use:inview
                    on:inview_enter={() => {
                        loadMore();
                    }}
                ></div>
            {/if}
        </Table.Body>
    </Table.Root>
</Section>
