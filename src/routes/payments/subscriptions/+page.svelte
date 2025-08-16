<script lang="ts">
    import Section from "$lib/components/sb/section/section.svelte";
    import { onMount } from "svelte";
    import Transaction from "$lib/sb/store/Transaction";
    import Amount from "../../me/wallet/Amount.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import {
        Check,
        EllipsisVertical,
        Gift,
        Package,
        RefreshCw,
        Square,
        SquareX,
        StopCircle,
        Trash2,
    } from "lucide-svelte";
    import Time from "svelte-time/Time.svelte";
    import * as Table from "$lib/components/ui/table";
    import { inview } from "svelte-inview";
    import { Skeleton } from "$lib/components/ui/skeleton";
    import Subscription from "$lib/sb/checkout/Subscription";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import Button from "$lib/components/ui/button/button.svelte";
    import DropdownItem from "$lib/components/sb/section/list/DropdownItem.svelte";
    import SubscriptionRow from "./SubscriptionRow.svelte";
    import type { SubscriptionAnalyticsGroups } from "$lib/sb/checkout/SubscriptionAnalytics";
    import AmountBox from "../../me/wallet/AmountBox.svelte";
    import ExchangeRate from "$lib/sb/wallet/ExchangeRate";
    import type Currency from "$lib/sb/store/Currency";
    import { fade } from "svelte/transition";

    let exchangeRate: ExchangeRate | null = null;
    let analytics: SubscriptionAnalyticsGroups | null = null;
    let transactions: Subscription[] = [];
    let hasMore = true;
    let page = 0;
    let loading = false;

    onMount(async () => {
        await Promise.all([loadAnalytics(), loadMore(), loadExchangeRate()]);
    });

    async function loadExchangeRate() {
        try {
            exchangeRate = await ExchangeRate.get();
        } catch (error) {
            console.error("Error loading exchange rate:", error);
        }
    }

    async function loadAnalytics() {
        try {
            analytics = await Subscription.getAnalytics();
        } catch (error) {
            console.error("Error loading analytics:", error);
        }
    }

    async function loadMore() {
        if (loading || !hasMore) return;
        loading = true;
        try {
            const loaded = await Subscription.list(page);
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
</script>

{#key analytics}
    <div class="grid md:grid-cols-3 grid-cols-1 gap-4">
        <AmountBox
            {currency}
            amounts={analytics?.mrr.amounts.map((a) => {
                return { currency: a.currency, amount: a.monthly };
            })}
            {exchangeRate}
        >
            MRR
            {#if analytics}
                <Badge class="mb-1">
                    {analytics.mrr.count}
                </Badge>
            {/if}
            <span slot="note"> Monthly Recurring Revenue </span>
        </AmountBox>

        <AmountBox
            {currency}
            amounts={analytics?.trial.amounts.map((a) => {
                return { currency: a.currency, amount: a.total };
            })}
            {exchangeRate}
        >
            Trials
            {#if analytics}
                <Badge class="mb-1">
                    {analytics.trial.count}
                </Badge>
            {/if}
            <span slot="note"> Active Trials </span>
        </AmountBox>

        <AmountBox
            {currency}
            amounts={analytics?.failed.amounts.map((a) => {
                return { currency: a.currency, amount: a.total };
            })}
            {exchangeRate}
        >
            Failed
            {#if analytics}
                <Badge class="mb-1">
                    {analytics.failed.count}
                </Badge>
            {/if}
            <span slot="note"> Failed Payments </span>
        </AmountBox>
    </div>
{/key}

<Section
    name="Subscriptions"
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
            {#each transactions as subscription}
                <SubscriptionRow {subscription} />
            {/each}
            {#if hasMore}
                {#if !loading}
                    <div
                        use:inview
                        on:inview_enter={() => {
                            loadMore();
                        }}
                    ></div>
                {/if}
                {#each Array(20) as _}
                    <Table.Row>
                        {#each Array(4) as _}
                            <Table.Cell>
                                <Skeleton class="h-[20px] my-2" />
                            </Table.Cell>
                        {/each}
                    </Table.Row>
                {/each}
            {/if}
        </Table.Body>
    </Table.Root>
</Section>
