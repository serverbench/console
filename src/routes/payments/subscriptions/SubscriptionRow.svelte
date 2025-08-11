<script lang="ts">
    import Amount from "../../me/wallet/Amount.svelte";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import {
        Check,
        CircleOff,
        CirclePlay,
        ClockAlert,
        EllipsisVertical,
        Gift,
        Loader2,
        Package,
        PauseCircle,
        RefreshCw,
        SmilePlus,
        Square,
        SquareDashed,
        SquareX,
        StopCircle,
    } from "lucide-svelte";
    import Time from "svelte-time/Time.svelte";
    import * as Table from "$lib/components/ui/table";
    import Subscription from "$lib/sb/checkout/Subscription";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import Button from "$lib/components/ui/button/button.svelte";
    import DropdownItem from "$lib/components/sb/section/list/DropdownItem.svelte";
    import { Switch } from "$lib/components/ui/switch";
    import Label from "$lib/components/ui/label/label.svelte";
    import Card from "$lib/components/ui/card/card.svelte";
    import moment from "moment";

    export let subscription: Subscription;
    let loading = false;
    let open = false;
    let instantly = false;

    const endedClass =
        "text-white bg-black dark:bg-neutral-900 dark:border border-neutral-750";
    const trialClass =
        "dark:text-cyan-500 dark:bg-cyan-500 dark:bg-opacity-10 text-cyan-700";
    const trialEndedClass =
        "dark:text-yellow-100 text-yellow-900 dark:bg-yellow-950 dark:bg-opacity-20 bg-opacity-10 bg-yellow-500";

    async function cancel() {
        try {
            loading = true;
            await subscription.end(instantly);
        } catch (error) {
            console.error("Error cancelling subscription:", error);
        } finally {
            loading = false;
        }
    }
</script>

<AlertDialog.Root bind:open>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
            <AlertDialog.Description class="flex flex-col gap-3">
                This action cannot be undone. This will permanently cancel the
                subscription.
                <Card class="flex flex-row gap-2 items-center p-4">
                    <Switch
                        bind:checked={instantly}
                        id={`sub-${subscription.id}`}
                    />
                    <Label for={`sub-${subscription.id}`}
                        >Cancel instantly</Label
                    >
                </Card>
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action on:click={() => cancel()}>
                {#if !loading}
                    {#if instantly}
                        Cancel Instantly
                    {:else}
                        Cancel At The End Of The Cycle
                    {/if}
                {:else}
                    <Loader2 class="animate-spin" />
                {/if}
            </AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<Table.Row>
    <Table.Cell>
        <Badge class="whitespace-nowrap">
            <Time relative timestamp={subscription.created} />
        </Badge>
    </Table.Cell>
    <Table.Cell>
        {#each subscription.checkout.store.groups as group}
            {#each group.lines as line}
                <div
                    class="bg-black dark:bg-white border border-opacity-10 bg-opacity-5 dark:bg-opacity-5 py-1 px-2 text-sm rounded flex-row gap-1 items-center inline-flex"
                >
                    {#if line.group.owner.id == subscription.checkout.store.member?.id}
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
        {#if subscription.checkout.store.member}
            <div class="flex flex-col gap-1">
                <p>{subscription.checkout.store.member.name}</p>
                <p class="text-xs">
                    {subscription.checkout.store.member.eid}@{subscription
                        .checkout.store.member.game.slug}
                </p>
            </div>
        {/if}
    </Table.Cell>
    <Table.Cell>
        <div class="flex flex-row gap-4 items-center justify-end">
            {#if subscription.failed}
                <Badge variant="destructive">
                    {#if subscription.finished}
                        Failed
                    {:else}
                        Retrying
                    {/if}
                </Badge>
            {/if}
            <Badge
                class="flex flex-row gap-1 items-center capitalize"
                variant={subscription.checkout.trialDays &&
                (subscription.cycle ?? 0) <= 1
                    ? "outline"
                    : "secondary"}
            >
                {#if subscription.checkout.trialDays && (subscription.cycle ?? 0) <= 1}
                    {#if subscription.finished || subscription.endBy}
                        Cancelled Trial
                    {:else}
                        Trialing
                    {/if}
                {:else}
                    {subscription.frequency}
                    {(subscription.cycle ?? 0) - (subscription.cycles ? 1 : 0)}
                    {#if subscription.cycles}
                        / {subscription.cycles}
                    {/if}
                {/if}
            </Badge>
            {#if (subscription.finished || subscription.endBy) && (!subscription.cycles || (subscription.cycle && subscription.cycles >= subscription.cycle))}
                <Badge
                    class={subscription.checkout.trialDays &&
                    (subscription.cycle ?? 0) <= 1
                        ? trialEndedClass
                        : endedClass}
                    variant="secondary"
                >
                    <div class="flex flex-row gap-1 items-center capitalize">
                        {#if subscription.checkout.trialDays && (subscription.cycle ?? 0) <= 1}
                            <CircleOff />
                        {:else}
                            <Square />
                        {/if}
                        <Time
                            relative
                            timestamp={subscription.endBy ||
                                subscription.finished}
                        />
                    </div>
                </Badge>
            {:else if subscription.finished && subscription.cycles && subscription.cycle && subscription.cycles < subscription.cycle}
                <Badge
                    class="flex flex-row gap-1 items-center capitalize  text-white bg-black dark:bg-neutral-900 dark:border border-neutral-750"
                    variant="secondary"
                >
                    <Square />
                    Completed
                    <Time relative timestamp={subscription.finished} />
                </Badge>
            {:else if subscription.failed}
                <Badge
                    class="flex flex-row gap-1 items-center capitalize dark:text-red-200 dark:bg-red-500 dark:bg-opacity-10 text-red-700 bg-red-50"
                    variant="secondary"
                >
                    <ClockAlert />
                    <Time relative timestamp={subscription.failed} />
                </Badge>
            {:else if subscription.cycle != null && subscription.cycle <= 1 && subscription.checkout.trialDays}
                <Badge
                    class="flex flex-row gap-1 items-center capitalize {trialClass}"
                    variant="secondary"
                >
                    <CirclePlay />
                    <Time
                        relative
                        timestamp={moment(subscription.created)
                            .add(subscription.checkout.trialDays, "days")
                            .toDate()}
                    />
                </Badge>
            {:else}
                <Badge
                    class="flex flex-row gap-1 items-center capitalize dark:text-green-500 dark:bg-green-500 dark:bg-opacity-10 text-green-700 bg-green-50"
                    variant="secondary"
                >
                    <RefreshCw />
                    <Time
                        relative
                        timestamp={moment(subscription.created)
                            .add(
                                (subscription.cycle ?? 1) -
                                    (subscription.checkout.trialDays ? 1 : 0),
                                subscription.frequency,
                            )
                            .toDate()}
                    />
                </Badge>
            {/if}
            <Amount
                amount={subscription.amount}
                currency={subscription.currency}
            />

            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                    <Button
                        builders={[builder]}
                        size="icon"
                        variant="secondary"
                        class="rounded-full aspect-square"
                        disabled={loading}
                    >
                        {#if loading}
                            <Loader2 class="animate-spin" />
                        {:else}
                            <EllipsisVertical />
                        {/if}
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content class="w-56 flex flex-col">
                    <DropdownMenu.Label>{subscription.id}</DropdownMenu.Label>
                    <DropdownMenu.Separator />
                    {#if !subscription.finished}
                        <DropdownItem
                            on:click={() => (open = true)}
                            destructive
                        >
                            <Square /> Cancel
                        </DropdownItem>
                    {/if}
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>
    </Table.Cell>
</Table.Row>
