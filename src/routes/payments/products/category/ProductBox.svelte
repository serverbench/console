<script lang="ts">
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Plus, ChevronDown, Check, ShoppingCart } from "lucide-svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import type StoreCategory from "$lib/sb/store/StoreCategory";
    import { createEventDispatcher } from "svelte";
    import Sku from "$lib/sb/store/sku/Sku";
    import type CountryCurrency from "$lib/sb/store/CountryCurrency";
    import Price from "./Price.svelte";
    import FrequencyPicker from "$lib/components/sb/picker/FrequencyPicker.svelte";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import List from "$lib/components/sb/section/list/list.svelte";
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import SkuPrice from "$lib/sb/store/sku/SkuPrice";
    import * as ContextMenu from "$lib/components/ui/context-menu";

    export let sku: Sku | null = null;
    export let category: StoreCategory;
    export let currencies: CountryCurrency[];

    let creating = false;
    let loading = false;
    let type: string = "item";

    let name: string;
    let price: number | null = null;
    let frequency: string | null = null;

    let extraFallback: SkuPrice[] = sku ? computeExtraFallback() : [];

    function computeExtraFallback() {
        let fallback: SkuPrice[] = [];
        for (const currency of currencies.filter((c) => c.country)) {
            for (const fallbackPricing of sku!.prices.filter(
                (p) => !p.country,
            )) {
                if (
                    !sku!.prices.find(
                        (p) =>
                            p.country == currency.country &&
                            p.frequency == fallbackPricing.frequency,
                    )
                ) {
                    fallback = [
                        ...fallback,
                        new SkuPrice(
                            "_",
                            sku!,
                            fallbackPricing.amount,
                            fallbackPricing.frequency,
                            currency.country!,
                        ),
                    ];
                }
            }
        }
        return fallback;
    }

    $: sku,
        (() => {
            if (sku) extraFallback = computeExtraFallback();
        })();

    const dispatch = createEventDispatcher();

    async function createSku() {
        loading = true;
        try {
            let result: Sku;
            if (type == "item") {
                result = await Sku.create(
                    category,
                    type,
                    name,
                    Math.round(
                        price! *
                            10 ** currencies.find((c) => !c.country)!.digits,
                    ),
                    frequency as "month" | "year" | null,
                );
                category = result.category!;
            } else if (type == "bundle") {
                throw new Error("not implemented");
            } else {
                throw new Error("invalid type");
            }
            frequency = null;
            name = "";
            price = null;
            type = "item";
            creating = false;
            dispatch("created", result);
        } catch (error) {}
        loading = false;
    }
</script>

<Dialog.Root bind:open={creating}>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Create a new {type}</Dialog.Title>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <Button class="w-full text-left" variant="outline">
                        <ChevronDown />
                        <span class="grow capitalize">
                            {type}
                        </span>
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    {#each ["item", "bundle"] as option}
                        <DropdownMenu.Item on:click={() => (type = option)}>
                            <Check class={type != option ? "opacity-0" : ""} />
                            {option}
                        </DropdownMenu.Item>
                    {/each}
                </DropdownMenu.Content>
            </DropdownMenu.Root>
            <Input bind:value={name} disabled={loading} placeholder="Name" />
            <div class="flex flex-row gap-2">
                <Input
                    class="grow"
                    bind:value={price}
                    disabled={loading}
                    placeholder="Price"
                    min={0}
                    type="number"
                />
                <FrequencyPicker bind:value={frequency} />
            </div>
        </div>
        <Dialog.Footer>
            <Button
                on:click={() => createSku()}
                class="capitalize"
                disabled={loading}
                type="submit">Create {type}</Button
            >
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<ContextMenu.Root>
    <ContextMenu.Trigger>
        <a
            href={sku != null ? `/payments/products/${sku.id}` : "#"}
            on:click={() => (sku == null ? (creating = true) : {})}
        >
            <Card.Root class="p-3 h-56">
                {#if !sku}
                    <div
                        class="w-full h-full flex flex-col items-center justify-center"
                    >
                        <Plus />
                    </div>
                {:else}
                    <div class="flex flex-col w-full h-full justify-between">
                        <p class="text-left text-3xl p-1">
                            {sku.name}
                        </p>
                        <div class="flex flex-row gap-2">
                            {#each sku.prices.filter((p) => !p.country) as price}
                                <Badge class="flex flex-row gap-2 items-center">
                                    <Price {price} {currencies} />
                                </Badge>
                            {/each}
                            {#if sku.prices.filter((p) => p.country).length > 0 || extraFallback.length > 0}
                                <Tooltip.Root>
                                    <Tooltip.Trigger>
                                        <Badge variant="outline">
                                            +{sku.prices.filter(
                                                (p) => p.country,
                                            ).length + extraFallback.length}
                                        </Badge>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content class="p-0 border-none">
                                        <List>
                                            {#each [...sku.prices.filter((p) => p.country), ...extraFallback] as price}
                                                <Item>
                                                    <Price
                                                        {price}
                                                        {currencies}
                                                    />
                                                </Item>
                                            {/each}
                                        </List>
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            {/if}
                        </div>
                    </div>
                {/if}
            </Card.Root>
        </a>
    </ContextMenu.Trigger>
    <ContextMenu.Content>
        <!-- todo 
        <ContextMenu.Item><ShoppingCart /> Create Checkout</ContextMenu.Item>
        -->
    </ContextMenu.Content>
</ContextMenu.Root>
