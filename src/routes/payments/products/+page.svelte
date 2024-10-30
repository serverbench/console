<script lang="ts">
    import Section from "$lib/components/sb/section/section.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import ProductRow from "./ProductRow.svelte";

    let categoryName = "";
</script>

<Section list used={1} name="Category Sets">
    <div slot="add" class="flex flex-col gap-3">
        <Input placeholder="Category Name" bind:value={categoryName} />
        <Button>Create Category</Button>
    </div>
    <ProductRow>
        cool
    </ProductRow>
    <ProductRow>
        simply
    </ProductRow>
    <ProductRow>
        raids
    </ProductRow>
</Section>

<Section list used={1} name="categories">
    <div slot="add" class="flex flex-col gap-3">
        <Input placeholder="Category Name" bind:value={categoryName} />
        <Button>Create Category</Button>
    </div>
    <ProductRow>
        cool ranks
    </ProductRow>
    <ProductRow>
        cool community gifts
    </ProductRow>
    <ProductRow>
        global badges
    </ProductRow>
    <ProductRow>
        particles and emotes
    </ProductRow>
</Section>
