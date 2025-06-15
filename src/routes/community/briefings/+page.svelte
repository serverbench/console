<script lang="ts">
    import Section from "$lib/components/sb/section/section.svelte";
    import Briefing, {
        BriefingPrompt,
        type IBriefing,
    } from "$lib/sb/moderation/briefing/Briefing";
    import { List } from "echarts";
    import { onMount } from "svelte";
    import * as Table from "$lib/components/ui/table";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Time from "svelte-time/Time.svelte";
    import { ArrowRight, Earth, Lock } from "lucide-svelte";
    import Button from "$lib/components/ui/button/button.svelte";

    let briefings: IBriefing[] | null = null;

    onMount(async () => {
        briefings = await Briefing.getList();
    });
</script>

<Section
    list
    loading={briefings === null}
    used={briefings?.length}
    name="Briefings"
    small
>
    <Table.Root>
        <Table.Header>
            <Table.Row>
                <Table.Head>Created</Table.Head>
                <Table.Head>Prompt</Table.Head>
                <Table.Head>From</Table.Head>
                <Table.Head>To</Table.Head>
                <Table.Head class="text-right">Details</Table.Head>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {#each briefings ?? [] as briefing}
                <Table.Row>
                    <Table.Cell>
                        <Badge class="whitespace-nowrap">
                            <Time relative timestamp={briefing.created} />
                        </Badge>
                    </Table.Cell>
                    <Table.Cell>
                        <div class="flex flex-row gap-2 items-center">
                            {#if briefing.prompt == BriefingPrompt.PRIVATE}
                                <Lock />
                            {:else}
                                <Earth />
                            {/if}
                            {briefing.prompt}
                        </div>
                    </Table.Cell>
                    <Table.Cell>
                        <Badge class="whitespace-nowrap" variant="secondary">
                            {briefing.from.toLocaleString()}
                        </Badge>
                    </Table.Cell>
                    <Table.Cell class="w-full">
                        <Badge class="whitespace-nowrap" variant="secondary">
                            {briefing.to.toLocaleString()}
                        </Badge>
                    </Table.Cell>
                    <Table.Cell class="text-right">
                        <Button href={`/community/briefings/${briefing.id}`} class="ml-auto" size="icon">
                            <ArrowRight />
                        </Button>
                    </Table.Cell>
                </Table.Row>
            {/each}
        </Table.Body>
    </Table.Root>
</Section>
