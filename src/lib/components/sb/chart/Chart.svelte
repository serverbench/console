<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    export let title: string;
    import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
    export let spans: Record<string, [number, number]>;
    const fallback = Object.keys(spans)[0];
    let spanK = fallback;

    $: spanK,
        (() => {
            if (!spanK) {
                spanK = fallback;
            }
            visible = false;
            setTimeout(() => {
                span = spans[spanK][0];
                resolution = spans[spanK][1];
                visible = true;
            }, 100);
        })();

    let visible = true;

    export let span: number | undefined = spans[fallback][0],
        resolution: number | undefined = spans[fallback][1];
    export let height: number;
</script>

<Card.Root class="relative overflow-hidden" style={`height:${height + 20}px`}>
    <div
        class="absolute flex flex-row gap-4 top-5 right-5 font-semibold uppercase text-xs select-none items-center"
    >
        <div class="rounded-full backdrop-blur-sm z-10 border overflow-hidden">
            <ToggleGroup.Root bind:value={spanK} size="sm" type="single">
                {#each Object.keys(spans) as s}
                    <ToggleGroup.Item value={s}>{s}</ToggleGroup.Item>
                {/each}
            </ToggleGroup.Root>
        </div>
        <div class="p-3 rounded-full backdrop-blur-sm z-10 border">
            {title}
        </div>
    </div>
    <div
        class:opacity-0={!visible}
        class="absolute w-full h-full top-0 left-0 transition-opacity duration-100"
    >
        {#key span}
            <slot />
        {/key}
    </div>
</Card.Root>
