<script lang="ts">
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import * as Card from "$lib/components/ui/card/index.js";
    import type StoreBundle from "$lib/sb/store/sku/StoreBundle";
    import StoreItem from "$lib/sb/store/sku/item/StoreItem";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Plus, ChevronDown, Check } from "lucide-svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import type StoreCategory from "$lib/sb/store/StoreCategory";
    import { createEventDispatcher } from "svelte";
    export let sku: StoreItem | StoreBundle | null = null;
    export let category: StoreCategory;
    let item: StoreItem | null =
        sku?.type == "item" ? (sku as StoreItem) : null;
    let bundle: StoreBundle | null =
        sku?.type == "bundle" ? (sku as StoreBundle) : null;

    let creating = false;
    let loading = false;
    let type: string = "item";

    let name: string;
    let price: number | null = null;
    let frequency: string | null = null;
    const frequencyReadable: Record<string, string> = {
        "": "one-time",
        month: "monthly",
        year: "yearly",
    };

    const dispatch = createEventDispatcher();

    function handleClick() {
        if (sku == null) {
            creating = true;
        } else {
        }
    }

    async function createSku() {
        loading = true;
        try {
            let result: StoreItem | StoreBundle;
            if (type == "item") {
                result = await StoreItem.create(
                    category,
                    name,
                    price!,
                    frequency as "month" | "year" | null,
                );
                category = result.category;
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
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        <Button class="text-left grow" variant="outline">
                            <ChevronDown />
                            <span class="grow capitalize">
                                {frequencyReadable[frequency ?? ""]}
                            </span>
                        </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                        {#each [null, "month", "year"] as f}
                            <DropdownMenu.Item on:click={() => (frequency = f)}>
                                <Check class={type != f ? "opacity-0" : ""} />
                                {frequencyReadable[f ?? ""]}
                            </DropdownMenu.Item>
                        {/each}
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
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

<button on:click={() => handleClick()}>
    <Card.Root class="p-3 h-36">
        {#if !sku}
            <div
                class="w-full h-full flex flex-col items-center justify-center"
            >
                <Plus />
            </div>
        {:else}
            <div class="flex flex-col gap-2 justify-between">
                <p class="text-lg">
                    {sku.name}
                </p>
                <div>
                    {#each sku.prices as price}
                        <Badge class="flex flex-row gap-2 items-center">
                            <span>
                                {price.amount}
                                {#if price.frequency}
                                    /{price.frequency.substring(0, 1)}
                                {/if}
                            </span>
                            {#if price.country}
                                <img
                                    class="h-4"
                                    src={`https://flagcdn.com/${price.country.toLowerCase()}.svg`}
                                    alt={`${price.country} flag`}
                                />
                            {/if}
                        </Badge>
                    {/each}
                </div>
            </div>
        {/if}
    </Card.Root>
</button>
