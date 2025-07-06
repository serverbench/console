<script lang="ts">
    import type Member from "$lib/sb/member/Member";
    import type ChatMessage from "$lib/sb/moderation/chat/ChatMessage";
    import { onMount } from "svelte";
    import * as Table from "$lib/components/ui/table";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Time from "svelte-time/Time.svelte";
    import {
        Earth,
        MessageCircleWarning,
        MessageCircleX,
        Sparkle,
    } from "lucide-svelte";
    import * as Avatar from "$lib/components/ui/avatar";
    import { Skeleton } from "$lib/components/ui/skeleton";
    import { inview } from "svelte-inview";
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import List from "$lib/components/sb/section/list/list.svelte";
    import { fade } from "svelte/transition";
    import type Connection from "$lib/sb/member/Connection";
    import NumberFlow from "@number-flow/svelte";

    export let member: Member;
    let page = 0;
    let anchor = new Date();

    let loading = false;
    let connections: Connection[] = [];
    let hasMore = true;
    export let blockLoad = false;

    onMount(async () => {
        if (blockLoad) return;
        await loadMore(true);
    });

    $: blockLoad, loadMore(true);

    let last = Date.now();

    async function loadMore(reset = false) {
        if (reset) {
            last = Date.now();
            page = 0;
            hasMore = true;
            anchor = new Date();
            connections = [];
            loading = false;
        }
        if (loading) return;
        if (!hasMore) return;
        const lastSnapshot = Number(last);
        loading = true;
        const newMessages = await member.getConnections(page, anchor);
        if (last == lastSnapshot) {
            for (const openConnection of newMessages.filter(
                (c) => c.closed == null,
            )) {
                duration[openConnection.id!] = getDuration(
                    Date.now() - openConnection.created.getTime(),
                );
                setInterval(() => {
                    duration[openConnection.id!] = getDuration(
                        Date.now() - openConnection.created.getTime(),
                    );
                }, 1000);
            }
            connections = [...connections, ...newMessages];
            if (newMessages.length < pageSize) {
                hasMore = false;
            }
            page++;
        }
        loading = false;
    }

    const pageSize = 50;

    function getDuration(ms: number): [string, number, string] {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return [`${days}d`, hours % 24, "h"];
        if (hours > 0) return [`${hours}h`, minutes % 60, "m"];
        if (minutes > 0) return [`${minutes}m`, seconds % 60, "s"];
        return ["", seconds, "s"];
    }

    function getFormattedDuration(ms: number): string {
        const [prefix, value, suffix] = getDuration(ms);
        return `${prefix}${value}${suffix}`;
    }

    let duration: Record<string, [string, number, string]> = {};
</script>

<div transition:fade={{ duration: 200 }}>
    <List>
        {#each connections as connection}
            <Item>
                {#if connection.session}
                    <Badge
                        variant="secondary"
                        class="whitespace-nowrap mr-auto"
                    >
                        {connection.session?.instance.server.slug}
                        {#if connection.session?.instance.name}
                            {connection.session?.instance.name}
                        {/if}
                    </Badge>
                {:else}
                    <div class="w-full"></div>
                {/if}
                {#if connection.closed}
                    <Badge variant="secondary" class="whitespace-nowrap">
                        <Time relative timestamp={connection.created} />
                    </Badge>
                {/if}
                {#if connection.idle}
                    <Badge variant="outline" class="whitespace-nowrap">
                        Idle
                    </Badge>
                {/if}
                {#if connection.closed}
                    <Badge class="whitespace-nowrap">
                        {getFormattedDuration(
                            connection.closed.getTime() -
                                connection.created.getTime(),
                        )}
                    </Badge>
                {:else}
                    <div class="flex flex-row gap-2 items-center">
                        {#if connection.id != null && duration[connection.id]}
                            <NumberFlow
                                prefix={duration[connection.id][0]}
                                value={duration[connection.id][1]}
                                suffix={duration[connection.id][2]}
                                class="whitespace-nowrap"
                            />
                        {/if}
                        <div
                            class:bg-emerald-600={!connection.idle}
                            class:bg-indigo-600={connection.idle}
                            class="w-4 h-4 rounded-full animate-pulse"
                        ></div>
                    </div>
                {/if}
            </Item>
        {/each}

        {#if !loading && hasMore && !blockLoad}
            <div
                use:inview
                on:inview_enter={() => {
                    loadMore();
                }}
                class="mb-1"
            />
        {/if}

        {#if hasMore || blockLoad}
            {#each Array(pageSize) as _}
                <Item>
                    <Skeleton class="h-[20px] w-full my-2" />
                </Item>
            {/each}
        {/if}
    </List>
</div>
