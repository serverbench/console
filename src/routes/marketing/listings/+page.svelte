<script lang="ts">
    import ListingSettings from "$lib/sb/voting/settings/ListingSettings";
    import { onMount } from "svelte";
    import SiteSetups from "./setups/SiteSetups.svelte";
    import BarChart from "$lib/components/sb/chart/BarChart.svelte";
    import ListingSiteSetup from "$lib/sb/voting/site/ListingSiteSetup";
    let settings: ListingSettings | null = null;

    onMount(async ()=>{
        settings = await ListingSettings.get();
    })

    const analyticsProvider = ListingSiteSetup.getJoinAnalytics
</script>
<BarChart name="Joining Members" provider={analyticsProvider} />

{#if settings}
    <SiteSetups {settings} />
{/if}
{#key settings}
    <SiteSetups {settings} />
{/key}
