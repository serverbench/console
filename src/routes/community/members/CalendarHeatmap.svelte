<script lang="ts">
    import { Chart } from "svelte-echarts";
    import { init, use } from "echarts/core";
    import {
        GridComponent,
        TooltipComponent,
        CalendarComponent,
    } from "echarts/components";
    import { CanvasRenderer } from "echarts/renderers";
    import { time, type EChartsOption, type EChartsType } from "echarts";
    import { Loader2 } from "lucide-svelte";
    import { blur } from "svelte/transition";
    import { dark } from "$lib";

    use([GridComponent, CanvasRenderer, TooltipComponent, CalendarComponent]);

    export let data: [Date, number][] | null = null;

    let options: EChartsOption = {};

    function computeOptions() {
        if (!data) {
            options = {};
            return;
        }
        options = {
            tooltip: {},
            visualMap: {
                show: false,
                min: data.reduce((min, d) => Math.min(min, d[1]), Infinity),
                max: data.reduce((max, d) => Math.max(max, d[1]), -Infinity),
                type: "piecewise",
                orient: "horizontal",
                left: "center",
                color: $dark
                    ? ["rgba(103, 232, 249, 1)", "rgba(103, 232, 249, 0.1)"]
                    : ["rgba(6, 182, 212, 1)", "rgba(6, 182, 212, 0.1)"],
            },
            calendar: {
                left: 20,
                top: 20,
                cellSize: ["auto", "auto"],
                splitLine: {
                    show: false,
                },
                range: [
                    data[0][0],
                    data[0][0].getTime() + 365 * 24 * 60 * 60 * 1000,
                ],
                itemStyle: {
                    borderWidth: 0.5,
                    color: $dark ? "#0a0a0a" : "#fafafa",
                    borderColor: $dark ? "#404040" : "#e5e5e5",
                },
                yearLabel: { show: false },
            },
            series: {
                type: "heatmap",
                coordinateSystem: "calendar",
                data: data.map((d) => {
                    return [time.format(d[0], "{yyyy}-{MM}-{dd}", false), d[1]];
                }),
            },
        };
    }

    $: data, $dark, computeOptions();
</script>

<div class="w-full h-full flex flex-row items-center justify-center">
    {#if data}
        <div transition:blur class="w-full h-full">
            <Chart {init} {options} />
        </div>
    {:else}
        <Loader2 class="animate-spin" />
    {/if}
</div>
