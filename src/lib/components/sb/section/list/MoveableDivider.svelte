<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import { ChevronDown, ChevronUp } from "lucide-svelte";

    export let position: number,
        max: number,
        min: number = 0,
        loading: boolean = false;
</script>

<div class="flex flex-row items-center">
    <hr class="border-primary w-1/12" />
    <span class="text-xs font-light text-primary whitespace-nowrap px-4">
        <slot />
    </span>
    <hr class="border-primary w-full" />
    <div class="rounded flex flex-row">
        <Button
            disabled={position == min || loading}
            size="icon"
            class="w-6 h-6 rounded-l"
            on:click={() => (position = position - 1)}
        >
            <ChevronUp />
        </Button>
        <Button
            size="icon"
            class="w-6 h-6 rounded-r"
            disabled={position == max || loading}
            on:click={() => (position = position + 1)}
        >
            <ChevronDown />
        </Button>
    </div>
    <hr class="border-primary w-4" />
</div>
