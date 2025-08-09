<script lang="ts">
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import List from "$lib/components/sb/section/list/list.svelte";
    import Section from "$lib/components/sb/section/section.svelte";
    import { Badge } from "$lib/components/ui/badge";
    import Community from "$lib/sb/Community";
    import ChatMessage from "$lib/sb/moderation/chat/ChatMessage";
    import ChatStream from "$lib/sb/moderation/chat/ChatStream";
    import Toxicity from "$lib/sb/moderation/chat/Toxicity";
    import User from "$lib/sb/User";
    import { Check, Cross, Loader2 } from "lucide-svelte";
    import { onMount } from "svelte";
    import { scale } from "svelte/transition";
    import ChatMessageItem from "../../community/members/[id]/messages/ChatMessageItem.svelte";

    onMount(async () => {
        await new ChatStream(onConnected, onMessages).stream();
    });

    let connectedDm: boolean | null = null;
    let connectedAll: boolean | null = null;
    let messages: ChatMessage[] = [];

    function onConnected(dm: boolean | null, all: boolean | null) {
        connectedDm = dm;
        connectedAll = all;
    }

    function onMessages(newMessages: ChatMessage[]) {
        messages = newMessages;
    }
</script>

<Section name="Chat Messages" small>
    <div class="overflow-auto h-[600px]">
        <List hideBorder hideTopBorder>
            {#each messages as message (message.id)}
                <ChatMessageItem showFrom {message} />
            {/each}
        </List>
    </div>
</Section>
<div class="flex flex-row gap-2 items-center justify-center">
    <Badge
        class="flex flex-row gap-2 items-center"
        variant={connectedDm === null ? "secondary" : undefined}
    >
        DMs
        {#if connectedDm === null}
            <Loader2 class="animate-spin" />
        {:else if connectedDm}
            <Check />
        {:else}
            <Cross />
        {/if}
    </Badge>
    <Badge
        class="flex flex-row gap-2 items-center"
        variant={connectedDm === null ? "secondary" : undefined}
    >
        Public
        {#if connectedAll === null}
            <Loader2 class="animate-spin" />
        {:else if connectedAll}
            <Check />
        {:else}
            <Cross />
        {/if}
    </Badge>
</div>
