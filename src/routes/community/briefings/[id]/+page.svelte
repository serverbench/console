<script lang="ts">
    import { page } from "$app/stores";
    import Briefing from "$lib/sb/moderation/briefing/Briefing";
    import { onMount } from "svelte";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import { FileText, Loader2 } from "lucide-svelte";
    import { sort } from "fast-sort";
    import Section from "$lib/components/sb/section/section.svelte";
    import BriefingSection from "$lib/sb/moderation/briefing/BriefingSection";
    import SvelteMarkdown from "svelte-markdown";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import BriefingSectoinEl from "./BriefingSectoinEl.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Time from "svelte-time/Time.svelte";

    let id: string;
    let briefing: Briefing | null = null;

    $: id = $page.params.id;

    onMount(async () => {
        if (!id) {
            throw new Error("No briefing ID provided");
        }
        briefing = await Briefing.get(id);
    });

    $: sections = sort(briefing?.sections ?? []).by([
        { desc: (s) => s.instance == null },
        { asc: (s) => `${s.instance?.server?.slug}-${s.instance?.name}` },
    ]);

    $: global = sections.find((s) => s.instance == null);
    $: instances = sections.filter(
        (s) => s.instance != null && s.highlights.length > 0,
    );
</script>

<Breadcrumb.Root>
    <Breadcrumb.List>
        <Breadcrumb.Item>
            <Breadcrumb.Link href="/community/briefings"
                >briefings</Breadcrumb.Link
            >
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        {#if briefing}
            <Breadcrumb.Item>
                <Breadcrumb.Page>
                    {briefing.id}
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
{#if briefing}
    <div
        class="flex flex-col gap-5 justify-center items-center text-center py-10"
    >
        <Badge variant="secondary" class="whitespace-nowrap">
            <Time relative timestamp={briefing.created} />
        </Badge>
        <h1 class="text-3xl font-black">
            {briefing.from.toLocaleString()} to {briefing.to.toLocaleString()}
        </h1>
        <p>
            The following report has been automatically. Some of the information
            may be inaccurate, outdated or incomplete.
        </p>
        <Button href={briefing.url} target="_blank">
            Download Report <FileText class="ml-2" />
        </Button>
    </div>
    {#each sections as section}
        <BriefingSectoinEl {section} />
    {/each}
{/if}
