<script lang="ts">
    import FxemojiCactus from "~icons/fxemoji/cactus";
    import * as Card from "$lib/components/ui/card";

    export let type: string,
        action = true,
        small = false;
</script>

<div class="flex flex-col gap-5 items-center">
    <div
        class:flex-col={!small}
        class:flex-row={small}
        class:items-center={small}
        class="flex gap-5"
    >
        <FxemojiCactus class={small ? 'h-10 w-10' : 'h-24 w-24 mx-auto'} />
        <div class="flex flex-col" class:text-center={!small} class:gap-5={!small} class:gap-2={small}>
            <span class="text-neutral-700 dark:text-neutral-300">
                This is empty... for now!
            </span>
            <h1>
                Let's create some {type}!
            </h1>
        </div>
    </div>
    {#if action}
        <Card.Root class="p-5 w-full max-w-xl">
            <slot />
        </Card.Root>
    {/if}
</div>
