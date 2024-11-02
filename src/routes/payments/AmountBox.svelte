<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
    import { Loader2 } from "lucide-svelte";
    export let amount: number | null = null;
</script>

<Card.Root class="p-5 relative">
    <p class="font-semibold">
        <slot />
    </p>
    <div class="w-full py-5">
        {#if amount == null}
            <Skeleton class="w-full h-24" />
        {/if}
    </div>
    <slot name="note" class="absolute bottom-0 p-5" />
</Card.Root>
