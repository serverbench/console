<script lang="ts">
    import Section from "$lib/components/sb/section/section.svelte";
    import { onMount } from "svelte";
    import Transaction from "$lib/sb/store/Transaction";
    import Amount from "../../me/wallet/Amount.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import { Check, Gift, Package, RefreshCw, StopCircle } from "lucide-svelte";
    import Time from "svelte-time/Time.svelte";
    import * as Table from "$lib/components/ui/table";
    import { inview } from "svelte-inview";
    import { Skeleton } from "$lib/components/ui/skeleton";
    import Subscription from "$lib/sb/checkout/Subscription";

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
            {#each transactions as transaction}
                <Table.Row>
                    <Table.Cell>
                        <Badge class="whitespace-nowrap">
                            <Time relative timestamp={transaction.created} />
                        </Badge>
                    </Table.Cell>
                    <Table.Cell>
                        {#each transaction.checkout.store.groups as group}
                            {#each group.lines as line}
                                <div
                                    class="bg-black dark:bg-white border border-opacity-10 bg-opacity-5 dark:bg-opacity-5 py-1 px-2 text-sm rounded flex-row gap-1 items-center inline-flex"
                                >
                                    {#if line.group.owner.id == transaction.checkout.store.member?.id}
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
                        {#if transaction.checkout.store.member}
                            <div class="flex flex-col gap-1">
                                <p>{transaction.checkout.store.member.name}</p>
                                <p class="text-xs">
                                    {transaction.checkout.store.member
                                        .eid}@{transaction.checkout.store.member
                                        .game.slug}
                                </p>
                            </div>
                        {/if}
                    </Table.Cell>
                    <Table.Cell>
                        <div
                            class="flex flex-row gap-2 items-center justify-end"
                        >
                            {#if transaction.finished}
                                <Badge
                                    class="flex flex-row gap-1 items-center capitalize dark:text-yellow-500 dark:bg-yellow-500 dark:bg-opacity-10 text-yellow-700 bg-yellow-50"
                                    variant="secondary"
                                >
                                    {transaction.finished.toLocaleString()}
                                    <StopCircle />
                                </Badge>
                            {:else}
                                <Badge
                                    class="flex flex-row gap-1 items-center capitalize dark:text-green-500 dark:bg-green-500 dark:bg-opacity-10 text-green-700 bg-green-50"
                                    variant="secondary"
                                >
                                    Active
                                    <Check />
                                </Badge>
                            {/if}
                            <Badge
                                class="flex flex-row gap-1 items-center capitalize"
                                variant="secondary"
                            >
                                {transaction.frequency}
                                {transaction.cycle}
                            </Badge>
                            <Amount
                                amount={transaction.amount}
                                currency={transaction.currency}
                            />
                        </div>
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
