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

    let transactions: Subscription[] = [];
    let hasMore = true;
    let page = 0;
    let loading = false;

    onMount(async () => {
        await loadMore();
    });

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
</script>

<Section name="Subscriptions" small>
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
