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

    export let member: Member;
    let page = 0;
    let anchor = new Date();

    let loading = false;
    let messages: ChatMessage[] = [];
    export let filters: ChatMessageFilter;
    let hasMore = true;

    const toxicityThreshold = 50;
    const averageToxicityThreshold = toxicityThreshold / 3;

    let profanity = false;

    onMount(async () => {
        await loadMore(true);
    });

    let last = Date.now();

    $: filters, loadMore(true);

    async function loadMore(reset = false) {
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

    const pageSize = 50;
</script>

{#if messages.length > 0}
    <div transition:fade={{ duration: 200 }}>
        <List>
            {#each messages as message}
                <Item>
                    <Badge variant="secondary" class="whitespace-nowrap">
                        <Time relative timestamp={message.created} />
                    </Badge>
                    <Badge variant="secondary" class="whitespace-nowrap">
                        {message.session.instance.server.slug}
                        {#if message.session.instance.name}
                            {message.session.instance.name}
                        {/if}
                    </Badge>
                    {#if message.to}
                        <div class="inline-flex flex-row gap-2 items-center">
                            <Avatar.Root class="w-4 h-4">
                                <Avatar.Image
                                    src={`https://minotar.net/helm/${message.to.eid}`}
                                    alt={message.to.name}
                                />
                                <Avatar.Fallback>
                                    {message.to.name.charAt(0).toUpperCase()}
                                </Avatar.Fallback>
                            </Avatar.Root>
                            <Badge class="whitespace-nowrap">
                                {message.to.name}
                            </Badge>
                        </div>
                    {/if}
                    {#if message.channel}
                        <Badge variant="secondary">
                            {message.channel}
                        </Badge>
                    {/if}
                    <p>
                        {message.message}
                    </p>
                    {#if (profanity ? message.toxicity.instantProfanity : message.toxicity.instant) > toxicityThreshold}
                        <Badge
                            class={"whitespace-nowrap flex flex-row gap-2" +
                                ((profanity
                                    ? message.toxicity.averageProfanity
                                    : message.toxicity.average) >
                                averageToxicityThreshold
                                    ? ""
                                    : " bg-yellow-300 text-black")}
                            variant="destructive"
                        >
                            {#if (profanity ? message.toxicity.averageProfanity : message.toxicity.average) > averageToxicityThreshold}
                                <MessageCircleX />
                            {:else}
                                <MessageCircleWarning />
                            {/if}
                        </Badge>
                    {/if}
                    {#if message.tagged}
                        <Badge variant="outline">
                            <Sparkle />
                        </Badge>
                    {/if}
                </Item>
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
        </List>
    </div>
{/if}
