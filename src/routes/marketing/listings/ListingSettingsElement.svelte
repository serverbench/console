<script lang="ts">
    import Section from "$lib/components/sb/section/section.svelte";
    import Tab from "$lib/components/sb/section/tab/Tab.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import ListingSettings from "$lib/sb/voting/settings/ListingSettings";
    import { Flame, Medal, Timer } from "lucide-svelte";
    import { onMount } from "svelte";

    let tab: string;
    export let settings: ListingSettings | null = null;
    let loading = false;
    let error: Error | null = null;
    onMount(async () => {
        loading = true;
        try {
            settings = await ListingSettings.get();
            error = null;
        } catch (e: any) {
            error = e as Error;
        }
        loading = false;
    });
</script>

<Section
    {error}
    name="settings"
    bind:tab
    {loading}
    tabs={{
        ranking: Medal,
        streaks: Flame,
        timings: Timer,
    }}
>
    {#if settings}
        <Tab {tab} name="ranking">
            <div class="flex flex-col gap-2">
                <Label>
                    Needed rankup points per rank (where <i>i</i> is the current
                    rank)
                </Label>
                <Input value={settings?.ranking?.rankupPoints} />
            </div>
            <div class="flex flex-col gap-2">
                <Label>
                    Start decreasing points after these innactivity periods:
                </Label>
                <Input type="number" value={settings?.ranking?.decreaseAfter} />
            </div>
            <div class="flex flex-col gap-2">
                <Label>
                    Number of points to decrease per period, after the above
                </Label>
                <Input
                    type="number"
                    value={settings?.ranking?.decreaseAmount}
                />
            </div>
            <div class="flex flex-col gap-2">
                <Label>
                    Require an streak of x periods to make goal rewards
                    available
                </Label>
                <Input type="number" value={2} />
            </div>
        </Tab>
        <Tab {tab} name="streaks">
            <div class="flex flex-col gap-2">
                <Label>
                    Grant a streak pass every x periods, where <i>i</i> is the cumulative
                    streak passes given
                </Label>
                <Input value={settings?.streak?.pass} />
            </div>
        </Tab>
        <Tab {tab} name="timings">
            <div class="flex flex-col gap-2">
                <Label>
                    Numbers of seconds each period lasts
                </Label>
                <Input value={settings?.period} />
            </div>
        </Tab>
    {/if}
</Section>
