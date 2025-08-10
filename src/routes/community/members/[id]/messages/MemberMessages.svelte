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
    import Button from "$lib/components/ui/button/button.svelte";
    import { fade } from "svelte/transition";
    import type { ChatMessageFilter } from "$lib/sb/member/Member";
    import MemberRelations from "../relations/MemberRelations.svelte";
    import Card from "$lib/components/ui/card/card.svelte";
    import ChatMessageItem from "./ChatMessageItem.svelte";

    export let member: Member;
    export let blockLoad = false;
    export let condensed = false;
    let page = 0;
    let anchor = new Date();

    let loading = false;
    let messages: ChatMessage[] = [];
    export let filters: ChatMessageFilter;
    let hasMore = true;

    let profanity = false;

    onMount(async () => {
        if (blockLoad) return;
        await loadMore(true);
    });

    $: blockLoad, loadMore(true);

    let last = Date.now();

    $: filters, loadMore(true);

    async function loadMore(reset = false) {
        if (blockLoad) return;
        if (reset) {
            last = Date.now();
            page = 0;
            hasMore = true;
            anchor = new Date();
            messages = [];
            loading = false;
        }
        if (loading) return;
        if (!hasMore) return;
        const lastSnapshot = Number(last);
        loading = true;
        const newMessages = await member.getChatMessages(page, anchor, filters);
        if (last == lastSnapshot) {
            messages = [...messages, ...newMessages];
            if (newMessages.length < pageSize) {
                hasMore = false;
            }
            page++;
        }
        loading = false;
    }

    const pageSize = 20;
</script>

<div transition:fade={{ duration: 200 }}>
    <List>
        {#each messages as message}
            <ChatMessageItem {condensed} {message} {profanity} />
        {/each}

        {#if !loading && hasMore}
            <div
                use:inview
                on:inview_enter={() => {
                    loadMore();
                }}
                class="mb-1"
            />
        {/if}

        {#if hasMore}
            {#each Array(pageSize) as _}
                <Item>
                    <Skeleton class="h-[20px] w-full my-2" />
                </Item>
            {/each}
        {/if}
        {#if messages.length == 0 && !loading && !hasMore && !blockLoad}
            <div class="text-center text-muted-foreground py-20">
                No messages found.
            </div>
        {/if}
    </List>
</div>
