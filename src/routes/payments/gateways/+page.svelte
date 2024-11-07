<script lang="ts">
    import MollieDarkLogo from "./logo/mollie/dark.svg";
    import MollieLightLogo from "./logo/mollie/light.svg";
    import PayPalDarkLogo from "./logo/paypal/dark.png";
    import PayPalLightLogo from "./logo/paypal/light.png";
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import List from "$lib/components/sb/section/list/list.svelte";
    import Logo from "$lib/components/sb/logo.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import AmountBox from "../AmountBox.svelte";
    import FxemojiBanknoteeuro from "~icons/fxemoji/banknoteeuro";
    import FxemojiLightningmood from "~icons/fxemoji/lightningmood";
    import * as Accordion from "$lib/components/ui/accordion";
    import * as ToggleGroup from "$lib/components/ui/toggle-group";
    import { Coins, Loader2, Pause, Zap } from "lucide-svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Section from "$lib/components/sb/section/section.svelte";
    import SimplePicker from "$lib/components/sb/picker/SimplePicker.svelte";
    import { onMount } from "svelte";
    import Wallet from "$lib/sb/Wallet";

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
        {
            dark: MollieDarkLogo,
            light: MollieLightLogo,
            name: "mollie",
        },
    ];

    let loading = false;
    let wallets: Wallet[] = [];
    let selectedWallet: Wallet | null = null;

    const gatewayNames = gateways.map((g) => g.name);

    onMount(async () => {
        loading = true;
        wallets = await Wallet.list();
        if (wallets.length <= 0) {
            wallets = [await Wallet.create("EUR")];
        }
        selectedWallet = wallets[0];
        loading = false;
    });
</script>

{#key wallets}
    <SimplePicker
        disabled={loading}
        bind:value={selectedWallet}
        name="Currency"
        items={wallets.map((w) => [w, w.currency.code])}
    />
{/key}
<div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
    <AmountBox amount={selectedWallet?.withdrawable} wallet={selectedWallet}>
        Withdrawable
        <div slot="note" class="text-xs leading-6">
            Withdrawable using the gateways below
        </div>
    </AmountBox>
    <AmountBox amount={selectedWallet?.settling} wallet={selectedWallet}>
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
    <AmountBox amount={selectedWallet?.credit} wallet={selectedWallet}>
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
    <Accordion.Item value="item-2">
        <Accordion.Trigger>
            <div>
                <FxemojiLightningmood class="inline-block pb-1 pr-2" />
                You can skip the withdrawal process by using 'direct'
            </div>
        </Accordion.Trigger>
        <Accordion.Content>
            We understand you might want your money as soon as possible. You can
            skip the withdrawal process by using the 'direct' option, which will
            bill the users using your linked account directly. If you use the
            withdrawal system (credit) instead, you'll be able to get your money
            after some days, and you'll get <Logo inline /> credit beneffits.
        </Accordion.Content>
    </Accordion.Item>
</Accordion.Root>

<List>
    {#each gateways as gateway}
        <Item>
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <div>
                        <div
                            class:w-26={gateway.chonky}
                            class="w-20 h-10 bg-contain hidden dark:block bg-no-repeat bg-left"
                            style={`background-image: url(${gateway.light})`}
                        />
                        <div
                            class:w-26={gateway.chonky}
                            class="w-20 h-10 bg-contain dark:hidden bg-no-repeat bg-left"
                            style={`background-image: url(${gateway.dark})`}
                        />
                    </div>
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <span>{gateway.name}</span>
                </Tooltip.Content>
                <div class="ml-auto">
                    <ToggleGroup.Root
                        value="credit"
                        type="single"
                        variant="outline"
                        disabled
                    >
                        <!--
                        <ToggleGroup.Item value="disable">
                            <Pause />
                            disable
                        </ToggleGroup.Item>
                        <ToggleGroup.Item value="direct">
                            <Zap />
                            direct
                        </ToggleGroup.Item>-->
                        <ToggleGroup.Item value="credit">
                            <Coins />
                            credit
                        </ToggleGroup.Item>
                    </ToggleGroup.Root>
                </div>
                <Button disabled={loading}>
                    {#if loading}
                        <Loader2 class="animate-spin" />
                    {:else}
                        0
                    {/if}
                    accounts
                </Button>
            </Tooltip.Root>
        </Item>
    {/each}
</List>
<Section name="withdrawals" used={0}>
    <div slot="add" class="flex flex-col gap-2">
        <SimplePicker name="Currency" items={[["eur", "EUR"]]} />
        <SimplePicker name="Account" items={[["paypal", "PayPal"]]} />
        <Button>Withdraw</Button>
    </div>
    ...
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
