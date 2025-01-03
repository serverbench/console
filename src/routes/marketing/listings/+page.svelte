<script lang="ts">
    import ListingSettings from "$lib/sb/voting/settings/ListingSettings";
    import { onMount } from "svelte";
    import SiteSetups from "./setups/SiteSetups.svelte";
    let settings: ListingSettings | null = null;

    onMount(async ()=>{
        settings = await ListingSettings.get();
    })
</script>
{#key settings}
    <SiteSetups {settings} />
{/key}
