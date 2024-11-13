<script lang="ts">
    import SimplePicker from "$lib/components/sb/picker/SimplePicker.svelte";
    import Section from "$lib/components/sb/section/section.svelte";
    import SiteSetup from "$lib/sb/voting/SiteSetup";
    import VotingSite from "$lib/sb/voting/VotingSite";
    import { onMount } from "svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import SiteSettings from "./SiteSettings.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import { ExternalLink } from "lucide-svelte";

    let siteSetups: SiteSetup[] = [];
    let votingSites: VotingSite[] = [];
    let loading = false;

    onMount(async () => {
        loading = true;
        try {
            siteSetups = await SiteSetup.list();
            votingSites = [
                ...(await VotingSite.listVerified()),
                ...(await VotingSite.listOwned()),
            ];
        } catch (error) {}
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

    let url: string | null = null;
    let selectedVotingSite: VotingSite | null = null;
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
            const votingSite = await VotingSite.create(
                domain!,
                protocols,
                resetScheme == "fixed" ? timezone : null,
                resetScheme == "fixed" ? reset : null,
                resetScheme == "cooldown" ? cooldown : null,
            );
            votingSites = [...votingSites, votingSite];
            const setup = await votingSite.use(url!, null, null, null);
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

<Section list name="Voting Sites" used={siteSetups.length}>
    <div slot="add" class="flex flex-col gap-3">
        {#key votingSites}
            <SimplePicker
                name="Voting Site"
                optional="New Voting Site"
                bind:value={selectedVotingSite}
                items={votingSites
                    .filter((s) => !siteSetups.find((ss) => ss.site.id == s.id))
                    .map((s) => [s.id, s.domain])}
            />
        {/key}
        <Input placeholder="Voting URL" bind:value={url} />
        {#if !selectedVotingSite}
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
                >Create Voting Site</Button
            >
        {/if}
    </div>
    {#each siteSetups as setup, i}
        <Item hideBottom={i == 5 || i == 7}>
            <Badge variant="secondary"
                >{Math.trunc((1 / siteSetups.length) * 10000) / 100}%</Badge
            >
            <p class="grow">
                {setup.site.domain}
            </p>
            <Button target="_blank" href={setup.url} size="icon" variant="outline" class="aspect-square rounded-full">
                <ExternalLink />
            </Button>
            <div slot="dropdown"></div>
        </Item>
        {#if i + 1 == 6}
            <div class="flex flex-row gap-3 items-center">
                <hr class="border-primary w-1/12" />
                <span class="text-xs font-light text-primary whitespace-nowrap">
                    fallback sites
                </span>
                <hr class="border-primary w-full" />
            </div>
        {/if}
        {#if i + 1 == 8}
            <div class="flex flex-row gap-3 items-center">
                <hr class="border-primary w-1/12" />
                <span
                    class="text-xs font-light text-primary block whitespace-nowrap"
                >
                    secondary sites
                </span>
                <hr class="border-primary w-full" />
            </div>
        {/if}
    {/each}
</Section>
<Section name="votes" used={0}>...</Section>
