<script lang="ts">
    import Candlestick from "$lib/components/sb/chart/Candlestick.svelte";
    import Chart from "$lib/components/sb/chart/Chart.svelte";
    import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";

    let span: number = 60 * 24;
    let resolution: number = 15;
</script>

<Chart
    height={300}
    spans={{
        "24h": [60 * 24, 15],
        "7d": [60 * 24 * 7, 60],
        "1mo": [60 * 24 * 7 * 30, 60 * 12],
    }}
    bind:span
    bind:resolution
    title="Online Players"
>
    <Candlestick {resolution} {span} />
</Chart>
{#each Array(50) as _ }
<Skeleton class="h-16 rounded"/>
{/each}