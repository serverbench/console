<script lang="ts">
    import Section from "$lib/components/sb/section/section.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import type Sku from "$lib/sb/store/sku/Sku";
    import { onMount, tick } from "svelte";
    import SkuPerk from "$lib/sb/store/sku/perk/SkuPerk";
    import SimplePicker from "$lib/components/sb/picker/SimplePicker.svelte";
    import { Input } from "$lib/components/ui/input";
    import PerkRow from "./PerkRow.svelte";
    import { X } from "lucide-svelte";

    export let product: Sku | null;

    let perks: SkuPerk[] = [];

    let perk: SkuPerk | null = null;
    let name: string | null = null;
    let amount: number | null = null;

    let loading = false;
    let loadingCreating = false;

    onMount(async () => {
        loading = true;
        try {
            perks = await SkuPerk.list();
        } catch (error) {}
        loading = false;
    });

    async function addPerk() {
        loadingCreating = true;
        try {
            if (perk == null) {
                const { perk } = await product!.createPerk(name!, amount);
                perks = [perk, ...perks];
            } else {
                await product!.addPerk(perk, amount);
            }
            name = null;
            amount = null;
            perk = null;
            await tick();
            product = product;
        } catch (error) {
            console.log("error!", error);
        }
        await tick();
        loadingCreating = false;
    }
</script>

<Section
    loading={loading || !product}
    name="perks and commands"
    list
    used={product?.perks.length ?? 0}
>
    <div class="flex flex-col gap-2" slot="add">
        {#if perks.length > 0}
            <SimplePicker
                optional={"create new perk"}
                name="Perk"
                disabled={loadingCreating}
                bind:value={perk}
                items={perks.map((p) => [p.simple(), p.name])}
            />
        {/if}
        {#if perk == null}
            <Input
                disabled={loadingCreating}
                bind:value={name}
                placeholder="Perk name"
            />
        {/if}
        <div class="flex flex-row gap-2 items-center">
            <Input
                bind:value={amount}
                type="number"
                disabled={loadingCreating}
                placeholder="Amount (Only if countable)"
            />
            {#if amount != null}
                <Button
                    disabled={loadingCreating}
                    variant="outline"
                    on:click={() => (amount = null)}
                    size="icon"
                    class="aspect-square"
                >
                    <X />
                </Button>
            {/if}
        </div>
        <Button on:click={() => addPerk()} disabled={loadingCreating}
            >Add Perk</Button
        >
    </div>
    {#if product}
        {#each product.perks as perk}
            <PerkRow bind:product bind:perks bind:perk />
        {/each}
    {/if}
</Section>
