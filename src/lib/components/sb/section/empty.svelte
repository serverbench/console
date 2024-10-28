<script lang="ts">
    import FluentEmojiChipmunk from "~icons/fluent-emoji/chipmunk";
    import FluentEmojiOrangutan from "~icons/fluent-emoji/orangutan";
    import FluentEmojiLizard from "~icons/fluent-emoji/lizard";
    import * as Card from "$lib/components/ui/card";

    export let type: string, action = true;
    const r = Math.random();
</script>

<div class="flex flex-col gap-5 items-center">
    {#if r < 0.5}
        <FluentEmojiChipmunk class="h-24 w-24 mx-auto" />
    {:else if r < 0.99}
        <FluentEmojiOrangutan class="h-24 w-24 mx-auto" />
    {:else}
        <FluentEmojiLizard class="h-24 w-24 mx-auto animate-bounce" />
    {/if}
    <span class="text-neutral-700 dark:text-neutral-300">
        This is empty... for now!
    </span>
    {#if action}
        <h1>
            Let's create your first {type}!
        </h1>
        <Card.Root class="p-5 w-full max-w-xl">
            <slot />
        </Card.Root>
    {/if}
</div>
