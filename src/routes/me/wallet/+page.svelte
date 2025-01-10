<script lang="ts">
    import PayPalDarkLogo from "./logo/paypal/dark.png";
    import PayPalLightLogo from "./logo/paypal/light.png";
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import Logo from "$lib/components/sb/logo.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import FxemojiBanknoteeuro from "~icons/fxemoji/banknoteeuro";
    import * as Accordion from "$lib/components/ui/accordion";
    import { RefreshCw } from "lucide-svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Section from "$lib/components/sb/section/section.svelte";
    import SimplePicker from "$lib/components/sb/picker/SimplePicker.svelte";
    import { onMount } from "svelte";
    import Wallet from "$lib/sb/wallet/Wallet";
    import type WalletTransaction from "$lib/sb/wallet/WalletTransaction";
    import AmountBox from "./AmountBox.svelte";
    import FluentEmojiEyes from "~icons/fluent-emoji/eyes";
    import Amount from "./Amount.svelte";
    import ExchangeRate from "$lib/sb/wallet/ExchangeRate";

    const gateways = [
        {
            light: "https://cdn.brandfolder.io/KGT2DTA4/at/6j9nnnhwcntq89f53ht4wrss/Stripe_wordmark_-_white.svg",
            dark: "https://cdn.brandfolder.io/KGT2DTA4/at/8vbr8k4mr5xjwk4hxq4t9vs/Stripe_wordmark_-_blurple.svg",
            name: "Stripe",
        },
        {
            name: "PayPal",
            dark: PayPalDarkLogo,
            light: PayPalLightLogo,
            chonky: true,
        },
    ];

    let loading = false;
    let wallets: Wallet[] = [];
    let selectedWallet: Wallet | null = null;
    let loadingTransactions = false;
    let transactions: WalletTransaction[] = [];
    let exchangeRate: ExchangeRate | null = null;

    async function reloadSelected() {
        loading = true;
        await Promise.all([
            loadWallets(),
            loadTransactions(),
            loadExchangeRates(),
        ]);
        loading = false;
    }

    async function loadWallets() {
        wallets = await Wallet.list();
        if (wallets.length <= 0) {
            wallets = [await Wallet.create("EUR")];
        }
        selectedWallet = wallets[0];
    }

    async function loadTransactions() {
        transactions = [];
        loadingTransactions = true;
        transactions = await Wallet.getTransactions(0);
        loadingTransactions = false;
    }

    async function loadExchangeRates() {
        exchangeRate = await ExchangeRate.get();
    }

    const gatewayNames = gateways.map((g) => g.name);

    onMount(async () => {
        reloadSelected();
    });
</script>

<div class="flex flex-row gap-2">
    {#key wallets}
        <SimplePicker
            disabled={loading}
            bind:value={selectedWallet}
            name="Currency"
            items={wallets.map((w) => [w, w.currency.code])}
        />
    {/key}
    <Button
        variant="outline"
        on:click={() => reloadSelected()}
        disabled={loading}
    >
        {#if loading}
            <RefreshCw class="animate-spin" />
        {:else}
            <RefreshCw />
        {/if}
    </Button>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
    <AmountBox
        amount="withdrawable"
        wallet={selectedWallet}
        {exchangeRate}
        {wallets}
    >
        Withdrawable
        <div slot="note" class="text-xs leading-6">
            Withdrawable using the gateways below
        </div>
    </AmountBox>
    <AmountBox
        amount="settling"
        wallet={selectedWallet}
        {exchangeRate}
        {wallets}
    >
        Settling Balance
        <div slot="note">
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <span class="text-xs text-left leading-6">
                        Once settled, this balance will become withdrawable.
                    </span>
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>
                        Transactions can take between 3-30 working days to
                        settle depending on the payment method that was used.
                        Once settled, this balance will become withdrawable.
                    </p>
                </Tooltip.Content>
            </Tooltip.Root>
        </div>
    </AmountBox>
    <AmountBox amount="credit" wallet={selectedWallet} {exchangeRate} {wallets}>
        Internal Credit
        <span slot="note" class="text-xs">
            <Badge class="scale-90" variant="secondary">1% APR</Badge> on your withdrawable
            balance
        </span>
    </AmountBox>
</div>

<Accordion.Root>
    <Accordion.Item value="item-1">
        <Accordion.Trigger>
            <div>
                <FxemojiBanknoteeuro class="inline-block pb-1 pr-2" />Get <Badge
                    class="scale-90"
                    variant="secondary">1% APR</Badge
                > when using
                <Logo inline /> credit!
            </div>
        </Accordion.Trigger>
        <Accordion.Content>
            Get extra 1% APR on your withdrawable balance as internal credit
            when you keep it in your account! You can use the extra internal
            credit to pay for your plan and hosted instances. Note internal
            credit cannot be withdrawn.
        </Accordion.Content>
    </Accordion.Item>
</Accordion.Root>

<Section name="withdrawals" used={0}>
    <div slot="add" class="flex flex-col gap-2">
        <div
            class="bg-yellow-500 bg-opacity-10 border-yellow-500 border p-3 text-yellow-500"
        >
            Payouts are being worked on. You can keep accumulating your balance
            until we finish this feature.
        </div>
        <div class="relative">
            <div class="flex flex-col gap-2 blur opacity-10">
                <SimplePicker name="Currency" items={[["eur", "EUR"]]} />
                <SimplePicker name="Account" items={[["paypal", "PayPal"]]} />
                <Button>Withdraw</Button>
            </div>
            <div
                class="absolute w-full h-full top-0 flex flex-col items-center justify-center"
            >
                <FluentEmojiEyes class="h-10 w-10" />
            </div>
        </div>
    </div>
    ...
</Section>
<Section list {loading} name="transactions" used={1}>
    {#each transactions as transaction}
        <Item hideDropdown>
            <Amount
                amount={transaction.net}
                currency={transaction.wallet.currency}
            />
            <div class="ml-auto">
                <Badge variant="outline">
                    {transaction.created}
                </Badge>
            </div>
        </Item>
    {/each}
</Section>

<div class="opacity-50 hover:opacity-100 transition-opacity text-xs leading-6">
    <Logo inline /> is not oficially affiliated with {gatewayNames
        .slice(0, gatewayNames.length - 1)
        .join(", ")} or {gatewayNames[gatewayNames.length - 1]}. All product and
    company names are trademarks™ or registered® trademarks of their
    respective holders. Use of them does not imply any affiliation with or
    endorsement by them. They are responsible for the transactions made on their
    services only, and we are not responsible for any issues that may arise from
    using their services.
</div>
