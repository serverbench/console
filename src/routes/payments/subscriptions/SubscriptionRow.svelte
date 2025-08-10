<script lang="ts">
    import Amount from "../../me/wallet/Amount.svelte";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import {
        Check,
        ClockAlert,
        EllipsisVertical,
        Gift,
        Loader2,
        Package,
        PauseCircle,
        SmilePlus,
        Square,
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
            {#if (subscription.finished && subscription.finished > new Date()) || (subscription.endBy && subscription.endBy > new Date())}
                <Badge
                    class="flex flex-row gap-1 items-center capitalize dark:text-yellow-500 dark:bg-yellow-500 dark:bg-opacity-10 text-yellow-700 bg-yellow-50"
                    variant="secondary"
                >
                    {(
                        (subscription.finished
                            ? subscription.finished
                            : subscription.endBy) ?? new Date(0)
                    ).toLocaleString()}
                    <PauseCircle />
                </Badge>
            {:else if subscription.finished}
                <Badge
                    class="flex flex-row gap-1 items-center capitalize dark:text-red-500 dark:bg-red-500 dark:bg-opacity-10 text-red-700 bg-red-50"
                    variant="secondary"
                >
                    {subscription.finished.toLocaleString()}
                    <SquareX />
                </Badge>
            {:else if subscription.failed}
                <Badge
                    class="flex flex-row gap-1 items-center capitalize dark:text-red-500 dark:bg-red-500 dark:bg-opacity-10 text-red-700 bg-red-50"
                    variant="secondary"
                >
                    {subscription.failed.toLocaleString()}
                    <ClockAlert />
                </Badge>
            {:else if subscription.cycle != null && subscription.cycle <= 1 && subscription.checkout.trialDays}
                <Badge
                    class="flex flex-row gap-1 items-center capitalize dark:text-blue-500 dark:bg-blue-500 dark:bg-opacity-10 text-blue-700 bg-blue-50"
                    variant="secondary"
                >
                    {moment(subscription.created)
                        .add(subscription.checkout.trialDays, "days")
                        .diff(moment(), 'day')}
                    days left
                    <SmilePlus />
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
                {subscription.frequency}
                {subscription.cycle}
                {#if subscription.cycles}
                    / {subscription.cycles}
                {/if}
            </Badge>
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
