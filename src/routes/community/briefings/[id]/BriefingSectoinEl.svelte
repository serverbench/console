<script lang="ts">
    import Section from "$lib/components/sb/section/section.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import BriefingSection from "$lib/sb/moderation/briefing/BriefingSection";
    import SvelteMarkdown from "svelte-markdown";
    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import { ArrowRight } from "lucide-svelte";

    export let section: BriefingSection;
</script>

<Section
    name={section.instance
        ? `${section.instance.server.slug} (${section.instance.name ?? "main"})`
        : "Global Overview"}
>
    {#each section.highlights as highlight, i}
        <div class="leading-7 flex flex-col gap-2 p-5">
            <h1 class="font-black">
                {highlight.title}
            </h1>
            <SvelteMarkdown source={highlight.content} />
            {#if highlight.messages.length > 0}
                <div class="border rounded-lg p-5 flex flex-col gap-2">
                    {#each highlight.messages as message}
                        <div class="flex flex-row gap-2 items-center">
                            <Avatar.Root class="w-6 h-6">
                                <Avatar.Image
                                    src={`https://minotar.net/helm/${message.from.name}/100.png`}
                                />
                                <Avatar.Fallback
                                    >{message.from.name[0]?.toUpperCase() ??
                                        "?"}</Avatar.Fallback
                                >
                            </Avatar.Root>
                            <div>
                                <Badge>
                                    {message.from.name}
                                    {#if message.to}
                                        <ArrowRight class="mx-2" />
                                        {message.to.name}
                                    {/if}
                                </Badge>
                                <Badge variant="secondary">
                                    {message.created.toLocaleString()}
                                </Badge>
                                {#if message.channel}
                                    <Badge variant="secondary">
                                        {message.channel}
                                    </Badge>
                                {/if}
                                {message.message}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
        {#if i != section.highlights.length - 1}
            <hr />
        {/if}
    {/each}
</Section>
