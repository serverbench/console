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
        entireHighlight = false,
        condensed = false,
        showFrom = false;
</script>

<Item clazz={message.toxicity.isToxic() && entireHighlight ? "bg-primary bg-opacity-20" : ""}>
    <div
        class:flex-col={condensed}
        class:flex-row={!condensed}
        class:items-center={!condensed}
        class="flex gap-4"
    >
        <div class="flex flex-row gap-4 items-center">
            <Badge variant="secondary" class="whitespace-nowrap">
                {#if condensed}
                    <Time
                        timestamp={message.created}
                        format="HH:mm:ss"
                        class="text-xs"
                    />
                {:else}
                    <Time relative timestamp={message.created} />
                {/if}
            </Badge>
            {#if showFrom}
                <div class="inline-flex flex-row gap-2 items-center">
                    {#if !condensed}
                        <Avatar.Root class="w-4 h-4">
                            <Avatar.Image
                                src={`https://minotar.net/helm/${message.from.eid}`}
                                alt={message.from.name}
                            />
                            <Avatar.Fallback>
                                {message.from.name.charAt(0).toUpperCase()}
                            </Avatar.Fallback>
                        </Avatar.Root>
                    {/if}
                    <Badge class="whitespace-nowrap">
                        {message.from.name}
                    </Badge>
                </div>
            {/if}
            {#if !condensed}
                <Badge variant="secondary" class="whitespace-nowrap">
                    {message.session.instance.server.slug}
                    {#if message.session.instance.name}
                        {message.session.instance.name}
                    {/if}
                </Badge>
            {/if}
            {#if message.to}
                <div class="inline-flex flex-row gap-2 items-center">
                    {#if !condensed}
                        <Avatar.Root class="w-4 h-4">
                            <Avatar.Image
                                src={`https://minotar.net/helm/${message.to.eid}`}
                                alt={message.to.name}
                            />
                            <Avatar.Fallback>
                                {message.to.name.charAt(0).toUpperCase()}
                            </Avatar.Fallback>
                        </Avatar.Root>
                    {/if}
                    <Badge variant="secondary" class="whitespace-nowrap">
                        {message.to.name}
                    </Badge>
                </div>
            {/if}
            {#if message.channel}
                <Badge variant="secondary">
                    {message.channel}
                </Badge>
            {/if}
        </div>
        <div class="flex flex-row gap-4 items-center">
            <p>
                {message.message}
            </p>
            {#if message.toxicity.instantProfanity == null || message.toxicity.instant == null || message.toxicity.averageProfanity == null || message.toxicity.average == null}
                <span transition:blur={{ duration: 199 }}>
                    <Loader2 class="animate-spin" />
                </span>
            {:else if message.toxicity.isToxic()}
                <span transition:blur={{ delay: 200 }}>
                    <Badge
                        class={"whitespace-nowrap flex flex-row gap-2" +
                            ((profanity
                                ? message.toxicity.averageProfanity
                                : message.toxicity.average) >
                            25
                                ? ""
                                : " bg-yellow-300 text-black")}
                        variant="destructive"
                    >
                        {#if (profanity ? message.toxicity.averageProfanity : message.toxicity.average) > 25}
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
        </div>
    </div>
</Item>
