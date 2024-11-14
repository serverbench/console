<script lang="ts">
    import type ListingSettings from "$lib/sb/voting/settings/ListingSettings";
    import ListingSettingsElement from "./ListingSettingsElement.svelte";
    import SiteSetups from "./setups/SiteSetups.svelte";
    let settings: ListingSettings | null = null;
</script>

<ListingSettingsElement bind:settings />
{#key settings}
    <SiteSetups {settings} />
{/key}
