<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import StoreCategory, {
        type StoreCategoryPolicy,
    } from "$lib/sb/store/StoreCategory";
    import { Check, Boxes } from "lucide-svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";

    let loading = false;

    export let category: StoreCategory;

    async function updatePolicy(policy: string | null) {
        loading = true;
        try {
            category = await category.update(category.name, policy as StoreCategoryPolicy | null, category.visible, category.paused);
        } catch (error) {}
        loading = false;
    }
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger asChild let:builder>
        <Button class="rounded-full capitalize" builders={[builder]} variant="outline">
            <Boxes />
            {category.policy ?? "standard"}
        </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="w-56">
        {#each [null, "tiered", "exclusive"] as policy}
            <DropdownMenu.Item on:click={() => updatePolicy(policy)}>
                {#if category.policy == policy}
                    <Check />
                {:else}
                    <Check class="opacity-0" />
                {/if}
                <span>{policy ?? "standard"}</span>
            </DropdownMenu.Item>
        {/each}
    </DropdownMenu.Content>
</DropdownMenu.Root>
