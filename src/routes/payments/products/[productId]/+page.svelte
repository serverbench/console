<script lang="ts">
    import type Sku from "$lib/sb/store/sku/Sku";
    import StoreCategory from "$lib/sb/store/StoreCategory";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import Section from "$lib/components/sb/section/section.svelte";
    import CountryCurrency from "$lib/sb/store/CountryCurrency";
    import PricingRow from "./PricingRow.svelte";
    import CountryPicker from "$lib/components/sb/picker/CountryPicker.svelte";
    import FrequencyPicker from "$lib/components/sb/picker/FrequencyPicker.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import type { Frequency } from "$lib/sb/store/sku/SkuPrice";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import { Loader2 } from "lucide-svelte";

    let categories: StoreCategory[] = [];
    let product: Sku | null = null;
    let currencies: CountryCurrency[] = [];
    let loading = false;

    $: productId = $page.params.productId;
    $: currency =
        currencies.find((c) => c.country == country) ??
        currencies.find((c) => !c.country);

    onMount(async () => {
        loading = true;
        try {
            currencies = await CountryCurrency.list();
            categories = await StoreCategory.list();
            product =
                categories
                    .flatMap((c) => c.skus)
                    .find((s) => s.id == productId) ?? null;
            if (!product) {
                goto("/payments/products");
            }
        } catch (error) {}
        loading = false;
    });

    let country: string | null = null;
    let frequency: string | null = null;
    let amount: number | null = null;

    async function addPrice() {
        try {
            product = (
                await product!.addPricing(
                    amount! * 10 ** currency!.digits,
                    frequency as Frequency | null,
                    country,
                )
            ).sku;
            amount = null;
            frequency = null;
            country = null;
        } catch (error) {}
    }
</script>

<Breadcrumb.Root>
    <Breadcrumb.List>
        <Breadcrumb.Item>
            <Breadcrumb.Link href="/payments/products">products</Breadcrumb.Link
            >
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        {#if product}
            <Breadcrumb.Item>
                <Breadcrumb.Link>
                    {product.category.name}
                </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
                <Breadcrumb.Page>
                    {product.name}
                </Breadcrumb.Page>
            </Breadcrumb.Item>
        {:else}
            <Breadcrumb.Item>
                <Breadcrumb.Page>
                    <Loader2 class="animate-spin" />
                </Breadcrumb.Page>
            </Breadcrumb.Item>
        {/if}
    </Breadcrumb.List>
</Breadcrumb.Root>

{#if !loading && !product}
    Unknown Sku
    <Button href="/payments/products">Go Back</Button>
{:else if loading || product}
    <Section name="Details">
        <Input value={product?.name} disabled={loading} />
    </Section>
    <Section used={product?.prices.length ?? 0} name="Prices" list {loading}>
        <div class="flex flex-col gap-2" slot="add">
            <CountryPicker disabled={loading} bind:value={country} />
            <FrequencyPicker disabled={loading} bind:value={frequency} />
            <Input
                disabled={loading}
                bind:value={amount}
                type="number"
                min={0}
            />
            <Button on:click={() => addPrice()} disabled={loading}
                >Add Price</Button
            >
        </div>
        {#each product?.prices ?? [] as price}
            <PricingRow
                on:delete={() => {
                    if (!product) return;
                    product.prices = product.prices.filter(
                        (p) => p.id != price.id,
                    );
                }}
                {currencies}
                {price}
            />
        {/each}
    </Section>
    <Section name="Perks" used={0}>...</Section>
{/if}
