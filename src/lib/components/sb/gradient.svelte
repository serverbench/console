<script lang="ts">
    // @ts-ignore
    import Gradient from "@bedard/gradient";
    import { onMount } from "svelte";
    let canvasDark: HTMLCanvasElement;
    let canvasLight: HTMLCanvasElement;
    let mounted = false;

    onMount(() => {
        new Gradient(canvasDark, {
            colors: ["#000000", "#242424"],
            seed: 7,
        });
        new Gradient(canvasLight, {
            colors: ["#ffffff", "#e3e3e3"],
            seed: 7,
        });
        mounted = true;
    });
</script>

<canvas
    bind:this={canvasDark}
    class:opacity-0={!mounted}
    class:opacity-50={mounted}
    class="w-full h-full absolute top-0 transition-opacity duration-1000 invisible dark:visible"
>
</canvas>


<canvas
    bind:this={canvasLight}
    class:opacity-0={!mounted}
    class:opacity-50={mounted}
    class="w-full h-full absolute top-0 transition-opacity duration-1000 dark:invisible"
>
</canvas>
