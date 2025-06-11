<script lang="ts">
    import type Sku from "$lib/sb/store/sku/Sku";
    import StoreCategory from "$lib/sb/store/StoreCategory";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import Section from "$lib/components/sb/section/section.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import {
        Loader2,
        Image,
        Info,
        InfinityIcon,
        RouteOff,
        EyeOff,
        Gift,
        Flag,
        ArchiveRestore,
    } from "lucide-svelte";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    import PricingTable from "./pricing/PricingTable.svelte";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import Logo from "$lib/components/sb/logo.svelte";
    import PerkTable from "./perks/PerkTable.svelte";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import Tab from "$lib/components/sb/section/tab/Tab.svelte";
    import Empty from "$lib/components/sb/section/empty.svelte";

    let categories: StoreCategory[] = [];
    let product: Sku | null = null;
    let loading = false;

    $: productId = $page.params.productId;

    onMount(async () => {
        loading = true;
        try {
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

    async function deleteProduct() {
        loading = true;
        try {
            await product!.remove();
            goto("/payments/products");
        } catch (error) {}
    }

    let tab: string = "limits";
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
                    {product.category?.name}
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
    <Section hideName {loading} name="Details">
        <div class="flex flex-row gap-3">
            <div class="flex flex-col gap-3 w-full">
                <Input value={product?.name} disabled={loading} />
                <Textarea class="min-h-40" placeholder="description" disabled />
            </div>
            <div
                class="border aspect-square flex flex-col gap-3 items-center justify-center"
            >
                <Image />
                <Button size="sm" variant="secondary">Upload Image</Button>
            </div>
        </div>
        <div class="flex flex-row gap-2">
            <AlertDialog.Root>
                <AlertDialog.Trigger asChild let:builder>
                    <Button
                        builders={[builder]}
                        variant="ghost"
                        class="destructive"
                    >
                        Delete Product
                    </Button>
                </AlertDialog.Trigger>
                <AlertDialog.Content>
                    <AlertDialog.Header>
                        <AlertDialog.Title
                            >Are you absolutely sure?</AlertDialog.Title
                        >
                        <AlertDialog.Description>
                            This action cannot be undone. This will permanently
                            delete the product.
                        </AlertDialog.Description>
                    </AlertDialog.Header>
                    <AlertDialog.Footer>
                        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                        <AlertDialog.Action
                            on:click={() => deleteProduct()}
                            class="destructive">Continue</AlertDialog.Action
                        >
                    </AlertDialog.Footer>
                </AlertDialog.Content>
            </AlertDialog.Root>
            <Button class="ml-auto">Save Changes</Button>
        </div>
    </Section>
    <PricingTable bind:product />
    <PerkTable bind:product />
    <Section name="other">
        <Section
            name="other"
            hideName
            list
            tabs={{
                limits: InfinityIcon,
                restrictions: RouteOff,
                visibility: EyeOff,
                gifting: Gift,
                goals: Flag,
                upselling: ArchiveRestore,
            }}
            bind:tab
        >
            <div class="py-16">
                <Empty type={tab}>
                    <Button class="w-full">Create {tab}</Button>
                </Empty>
            </div>
        </Section>
    </Section>
{/if}
