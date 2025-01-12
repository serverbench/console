<script lang="ts">
    import SimplePicker from "$lib/components/sb/picker/SimplePicker.svelte";
    import Section from "$lib/components/sb/section/section.svelte";
    import { onMount } from "svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import { ExternalLink } from "lucide-svelte";
    import MoveableDivider from "$lib/components/sb/section/list/MoveableDivider.svelte";
    import ListingSiteSetup from "$lib/sb/voting/site/ListingSiteSetup";
    import ListingSite from "$lib/sb/voting/site/ListingSite";
    import SiteSettings from "../form/SiteSettings.svelte";
    import type ListingSettings from "$lib/sb/voting/settings/ListingSettings";

    export let settings: ListingSettings | null;

    let primaryFallbackStart = settings?.primary?.show
        ? settings?.primary?.show - 1
        : 0;
    let secondaryStart =
        primaryFallbackStart + (settings?.primary?.fallback ?? 0);
    let secondaryFallbackStart =
        secondaryStart + (settings?.secondary?.show ?? 0);
    let secondaryEnd =
        secondaryFallbackStart + (settings?.primary?.fallback ?? 0);

    $: primaryFallbackStart, scheduleDividerUpdate();
    $: secondaryStart, scheduleDividerUpdate();
    $: secondaryFallbackStart, scheduleDividerUpdate();
    $: secondaryEnd, scheduleDividerUpdate();

    let siteSetups: ListingSiteSetup[] = [];
    let listingSites: ListingSite[] = [];
    let loading = false;
    let updatingLimits = false;

    let scheduledDividerUpdate: number | null = null;

    function scheduleDividerUpdate() {
        if (scheduledDividerUpdate != null) {
            clearTimeout(scheduledDividerUpdate);
        }
        scheduledDividerUpdate = setTimeout(async () => {
            scheduledDividerUpdate = null;
            await updateDivider();
        }, 1500);
    }

    async function updateDivider() {
        if (!settings) return;
        if (!settings.primary) return;
        if (!settings.secondary) return;
        updatingLimits = true;
        try {
            await Promise.all([
                settings.primary.update(
                    primaryFallbackStart,
                    secondaryStart - primaryFallbackStart,
                ),
                settings.secondary.update(
                    secondaryFallbackStart - secondaryStart,
                    secondaryEnd - secondaryFallbackStart,
                ),
            ]);
        } catch (error) {
            console.log(error);
        }
        updatingLimits = false;
    }

    onMount(async () => {
        loading = true;
        if (!settings) return;
        try {
            siteSetups = await ListingSiteSetup.list();
            listingSites = [
                ...(await ListingSite.listVerified()),
                ...(await ListingSite.listOwned()),
            ];
        } catch (error) {
            console.log(error);
        }
        loading = false;
    });

    $: url,
        (() => {
            try {
                if (url) {
                    domain = new URL(url).hostname;
                } else {
                    throw new Error("no domain");
                }
            } catch (error) {
                domain = null;
            }
        })();

    let discriminator: string | null = null;
    let url: string | null = null;
    let selectedListingSite: ListingSite | null = null;
    let resetScheme: "cooldown" | "fixed" = "cooldown";
    let cooldown = 0;
    let reset = 0;
    let timezone: string | null = null;
    let creating = false;
    let domain: string | null = null;
    let protocols: Record<string, string | null> = {};

    async function create() {
        creating = true;
        try {
            const listingSite = await ListingSite.create(
                domain!,
                protocols,
                resetScheme == "fixed" ? timezone : null,
                resetScheme == "fixed" ? reset * 3600 : null,
                resetScheme == "cooldown" ? cooldown * 3600 : null,
            );
            listingSites = [...listingSites, listingSite];
            const setup = await listingSite.use(
                url!,
                null,
                null,
                null,
                discriminator && discriminator.length > 0
                    ? discriminator
                    : null,
            );
            siteSetups = [...siteSetups, setup];
            domain = null;
            url = null;
            timezone = null;
            reset = 0;
            cooldown = 24;
            resetScheme = "cooldown";
            protocols = {};
        } catch (error) {
            console.log(error);
        }
        creating = false;
    }
</script>

<Section {loading} list name="Listing Sites" used={siteSetups.length}>
    <div slot="add" class="flex flex-col gap-3">
        {#key listingSites}
            <SimplePicker
                name="Listing Site"
                optional="New Listing Site"
                bind:value={selectedListingSite}
                items={listingSites
                    .filter((s) => !siteSetups.find((ss) => ss.site.id == s.id))
                    .map((s) => [s.id, s.domain])}
            />
        {/key}
        <Input placeholder="Listing URL" bind:value={url} />
        <Input
            placeholder="Discriminator ([discriminator].example.com)"
            bind:value={discriminator}
        />
        {#if !selectedListingSite}
            <SiteSettings
                hideDomain
                bind:creating
                bind:domain
                bind:resetScheme
                bind:cooldown
                bind:reset
                bind:timezone
                bind:protocols
            />
            <Button on:click={() => create()} disabled={creating}
                >Create Listing Site</Button
            >
        {/if}
    </div>
    {#each siteSetups as setup, i}
        <Item
            hideBottom={settings
                ? [
                      primaryFallbackStart,
                      secondaryStart,
                      secondaryFallbackStart,
                      secondaryEnd,
                  ].includes(i)
                : false}
        >
            <Badge variant="secondary"
                >{Math.trunc((1 / siteSetups.length) * 10000) / 100}%</Badge
            >
            <p class="grow">
                {setup.site.domain}
            </p>
            <Button
                target="_blank"
                href={setup.url}
                size="icon"
                variant="outline"
                class="aspect-square rounded-full"
            >
                <ExternalLink />
            </Button>
            <div slot="dropdown"></div>
        </Item>
        {#if settings != null}
            {#if i == primaryFallbackStart}
                <MoveableDivider
                    bind:position={primaryFallbackStart}
                    max={secondaryStart}
                    loading={updatingLimits}
                >
                    fallback primary sites
                </MoveableDivider>
            {/if}
            {#if i == secondaryStart}
                <MoveableDivider
                    bind:position={secondaryStart}
                    min={primaryFallbackStart}
                    max={secondaryFallbackStart}
                    loading={updatingLimits}
                >
                    secondary sites
                </MoveableDivider>
            {/if}
            {#if i == secondaryFallbackStart}
                <MoveableDivider
                    bind:position={secondaryFallbackStart}
                    min={secondaryStart}
                    max={secondaryEnd}
                    loading={updatingLimits}
                >
                    fallback secondary sites
                </MoveableDivider>
            {/if}
            {#if i == secondaryEnd}
                <MoveableDivider
                    bind:position={secondaryEnd}
                    min={secondaryFallbackStart}
                    max={siteSetups.length - 1}
                    loading={updatingLimits}
                >
                    extra (hidden) sites
                </MoveableDivider>
            {/if}
        {/if}
    {/each}
</Section>
