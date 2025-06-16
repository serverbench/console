<script lang="ts">
    import { page } from "$app/stores";
    import type { InstanceCount } from "$lib/sb/member/Connection";
    import Member from "$lib/sb/member/Member";
    import { onMount } from "svelte";
    import MemberMessages from "./MemberMessages.svelte";
    import * as Avatar from "$lib/components/ui/avatar";
    import Section from "$lib/components/sb/section/section.svelte";
    import * as HoverCard from "$lib/components/ui/hover-card/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import { Activity, History, Loader2 } from "lucide-svelte";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Country from "$lib/components/sb/country.svelte";
    import { blur, fade } from "svelte/transition";
    import InstancePie from "../InstancePie.svelte";
    import ActivityClock from "../ActivityClock.svelte";

    let member: Member | null = null;
    let country: string | null | undefined = undefined;
    let instances: InstanceCount[] = [];
    let clock: number[][] = []

    onMount(async () => {
        const id = $page.params.id;
        member = await Member.fromId(id);
        country = await member.getCountry();
        instances = await member.getFavoriteInstances();
        clock = await member.getActivityClock();
    });
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
        <div class="h-64 w-full flex flex-row gap-4">
            <Card.Root class="h-full py-5 aspect-square">
                <InstancePie {instances} />
            </Card.Root>
            <Card.Root class="h-full py-5 aspect-square">
                <ActivityClock data={clock} />
            </Card.Root>
            <Card.Root class="h-full w-full flex flex-col items-center justify-center">
                calendar heatmap
            </Card.Root>
        </div>
        <MemberMessages {member} />
    </div>
{/if}
