<script lang="ts">
    import Section from "$lib/components/sb/section/section.svelte";
    import Tab from "$lib/components/sb/section/tab/Tab.svelte";
    import ListingSettings from "$lib/sb/voting/settings/ListingSettings";
    import { Flame, Medal, Timer } from "lucide-svelte";
    import { onMount } from "svelte";

    let selected: string;
    export let settings: ListingSettings | null = null;
    let loading = false;
    let error: Error | null = null;
    onMount(async () => {
        loading = true;
        try {
            settings = await ListingSettings.get();
            error = null
        } catch (e:any) {
            error = e as Error;
        }
        loading = false;
    });
</script>

<Section
    {error}
    name="settings"
    bind:selected
    {loading}
    tabs={{
        ranking: Medal,
        streaks: Flame,
        timings: Timer,
    }}
>
    {#if settings}
        <Tab {selected} name="ranking">asd</Tab>
        <Tab {selected} name="streaks">streaks</Tab>
        <Tab {selected} name="streaks">timer</Tab>
    {/if}
</Section>
