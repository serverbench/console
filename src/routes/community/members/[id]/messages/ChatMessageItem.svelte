<script lang="ts">
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import type ChatMessage from "$lib/sb/moderation/chat/ChatMessage";
    import { Avatar } from "bits-ui";
    import {
        Loader2,
        MessageCircleWarning,
        MessageCircleX,
        Sparkle,
    } from "lucide-svelte";
    import Time from "svelte-time/Time.svelte";
    import { blur } from "svelte/transition";
    export let message: ChatMessage,
        profanity = false,
        showFrom = false;

    const toxicityThreshold = 50;
    const averageToxicityThreshold = toxicityThreshold / 3;
</script>

<Item>
    {#if showFrom}
        <div class="inline-flex flex-row gap-2 items-center">
            <Avatar.Root class="w-4 h-4">
                <Avatar.Image
                    src={`https://minotar.net/helm/${message.from.eid}`}
                    alt={message.from.name}
                />
                <Avatar.Fallback>
                    {message.from.name.charAt(0).toUpperCase()}
                </Avatar.Fallback>
            </Avatar.Root>
            <Badge class="whitespace-nowrap">
                {message.from.name}
            </Badge>
        </div>
    {/if}
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
    {#if message.toxicity.instantProfanity == null || message.toxicity.instant == null || message.toxicity.averageProfanity == null || message.toxicity.average == null}
        <span transition:blur>
            <Loader2 class="animate-spin" />
        </span>
    {:else if (profanity ? message.toxicity.instantProfanity : message.toxicity.instant) > toxicityThreshold}
        <span transition:blur>
            <Badge
                class={"whitespace-nowrap flex flex-row gap-2" +
                    ((profanity
                        ? message.toxicity.averageProfanity
                        : message.toxicity.average) > averageToxicityThreshold
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
        </span>
    {/if}
    {#if message.tagged}
        <Badge variant="outline">
            <Sparkle />
        </Badge>
    {/if}
</Item>
