<script lang="ts">
    import { page } from "$app/stores";
    import type { InstanceCount } from "$lib/sb/member/Connection";
    import Member, { type ChatMessageFilter } from "$lib/sb/member/Member";
    import { onMount } from "svelte";
    import MemberMessages from "./messages/MemberMessages.svelte";
    import * as Avatar from "$lib/components/ui/avatar";
    import { Activity, History, Loader2 } from "lucide-svelte";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Country from "$lib/components/sb/country.svelte";
    import { blur, fade } from "svelte/transition";
    import InstancePie from "../InstancePie.svelte";
    import ActivityClock from "../ActivityClock.svelte";
    import CalendarHeatmap from "../CalendarHeatmap.svelte";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import MemberMessagesFilter from "./messages/MemberMessagesFilter.svelte";
    import MemberSessions from "./sessions/MemberSessions.svelte";
    import MemberRelations from "./relations/MemberRelations.svelte";

    let member: Member | null = null;
    let country: string | null | undefined = undefined;
    let instances: InstanceCount[] = [];
    let clock: number[][] | null = null;
    let calendar: [Date, number][] | null = null;
    let tab: string = "messages";
    let chatFilters: ChatMessageFilter = {};
    let blockLoad = true;

    onMount(async () => {
        await load();
    });

    async function load() {
        blockLoad = true;
        member = null;
        country = null;
        instances = [];
        clock = null;
        calendar = null;
        const id = $page.params.id;
        member = await Member.fromId(id);
        country = await member.getCountry();
        instances = await member.getFavoriteInstances();
        clock = await member.getActivityClock();
        calendar = await member.getActivityCalendar();
        console.log(await member.getChatRelations());
        blockLoad = false;
    }

    $: $page.params.id, load();
</script>

<Breadcrumb.Root>
    <Breadcrumb.List>
        <Breadcrumb.Item>
            <Breadcrumb.Link href="/community/members">members</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        {#if member}
            <Breadcrumb.Item>
                <Breadcrumb.Page>
                    {member.name}
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
{#key member}
    {#if member}
        <div transition:fade={{ duration: 200 }} class="flex flex-col gap-4">
            <Card.Root>
                <Card.Content>
                    <div class="flex flex-row items-center gap-3">
                        <Avatar.Root>
                            <Avatar.Image
                                src={`https://minotar.net/helm/${member.eid}.png`}
                            />
                            <Avatar.Fallback>
                                {member.name.charAt(0).toUpperCase()}
                            </Avatar.Fallback>
                        </Avatar.Root>
                        <p class="text-lg mr-auto">
                            {member.name}
                        </p>
                        {#if country}
                            <div transition:blur>
                                <Country {country} />
                            </div>
                        {/if}
                        {#if member.firstConnection && member.firstConnection.listingSite}
                            <Badge variant="secondary">
                                {member.firstConnection.listingSite.domain}
                            </Badge>
                        {/if}
                        <Badge>
                            {member.created.toLocaleDateString()}
                        </Badge>
                    </div>
                </Card.Content>
            </Card.Root>
            <div class="w-full flex flex-row gap-4 h-80">
                <Card.Root
                    class="h-full py-5 md:aspect-square w-full md:w-auto"
                >
                    <InstancePie {instances} />
                </Card.Root>
                <Card.Root
                    class="h-full py-5 md:aspect-square w-full md:w-auto"
                >
                    <ActivityClock data={clock} />
                </Card.Root>
                <Card.Root
                    class="h-full py-5 md:aspect-square w-full md:w-auto"
                >
                    <MemberRelations {member} />
                </Card.Root>
                <Card.Root
                    class="h-full w-full flex-col items-center justify-center p-5 md:flex hidden"
                >
                    <CalendarHeatmap data={calendar} />
                </Card.Root>
            </div>
            <Card.Root
                class="h-80 flex-col items-center justify-center p-5 flex md:hidden"
            >
                <CalendarHeatmap data={calendar} />
            </Card.Root>

            <Tabs.Root bind:value={tab}>
                <div class="flex flex-row items-center w-full justify-between">
                    <Tabs.List>
                        <Tabs.Trigger value="messages">Messages</Tabs.Trigger>
                        <Tabs.Trigger value="sessions">Sessions</Tabs.Trigger>
                    </Tabs.List>
                    {#if tab == "messages"}
                        <MemberMessagesFilter bind:filters={chatFilters} />
                    {/if}
                </div>
                <Tabs.Content value="messages">
                    <MemberMessages
                        bind:blockLoad
                        {member}
                        filters={chatFilters}
                    />
                </Tabs.Content>
                <Tabs.Content value="sessions">
                    <MemberSessions bind:blockLoad {member} />
                </Tabs.Content>
            </Tabs.Root>
        </div>
    {/if}
{/key}
