<script lang="ts">
    // @ts-ignore
    import { onMount } from "svelte";
    let canvasDark: HTMLDivElement;
    let canvasLight: HTMLDivElement;
    let mounted = false;

    onMount(() => {
        const vanta = (window as any).VANTA;
        vanta.DOTS({
            el: canvasDark,
            color: 0xffffff,
            color2: 0xffffff,
            backgroundColor: 0x0,
            showLines: false,
        });
        vanta.DOTS({
            el: canvasLight,
            color: 0x0,
            color2: 0xffffff,
            backgroundColor: 0xffffff,
            showLines: false,
        });
        mounted = true;
    });
</script>

<div
    bind:this={canvasDark}
    class:opacity-0={!mounted}
    class:opacity-30={mounted}
    class="w-full h-full absolute top-0 transition-opacity duration-1000 invisible dark:visible"
></div>

<div
    bind:this={canvasLight}
    class:opacity-0={!mounted}
    class:opacity-30={mounted}
    class="w-full h-full absolute top-0 transition-opacity duration-1000 dark:invisible"
></div>
