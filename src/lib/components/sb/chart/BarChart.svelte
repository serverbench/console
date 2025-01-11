<script lang="ts">
    import { Chart } from "svelte-echarts";
    import { init, use } from "echarts/core";
    import type { EChartsOption } from "echarts";
    import { BarChart } from "echarts/charts";
    import wonderland from "./wonderland.project.json"; // Ensure this is a valid JSON theme
    import {
        GridComponent,
        TitleComponent,
        LegendComponent,
        TooltipComponent,
    } from "echarts/components";
    import { CanvasRenderer } from "echarts/renderers";

    use([
        BarChart,
        GridComponent,
        CanvasRenderer,
        TitleComponent,
        LegendComponent,
        TooltipComponent,
    ]);

    export let options: EChartsOption | null = null;
</script>

<div class="border h-96">
    {#if options}
        <Chart {init} {options} />
    {/if}
</div>
