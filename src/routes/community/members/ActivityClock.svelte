<script lang="ts">
    import { Chart } from "svelte-echarts";
    import { init, use } from "echarts/core";
    import {
        BarChart,
        CustomChart,
        LineChart,
        ScatterChart,
    } from "echarts/charts";
    import {
        GridComponent,
        LegendComponent,
        TitleComponent,
        TooltipComponent,
        AriaComponent,
        PolarComponent,
        VisualMapComponent,
    } from "echarts/components";
    import { CanvasRenderer } from "echarts/renderers";
    import type { EChartsOption, EChartsType } from "echarts";
    import { SunburstChart } from "echarts/charts";
    import type { InstanceCount } from "$lib/sb/member/Connection";
    import { Loader2 } from "lucide-svelte";
    import { blur } from "svelte/transition";
    import { dark } from "$lib";

    use([
        LineChart,
        BarChart,
        GridComponent,
        CanvasRenderer,
        TitleComponent,
        LegendComponent,
        TooltipComponent,
        SunburstChart,
        AriaComponent,
        PolarComponent,
        VisualMapComponent,
        CustomChart,
        ScatterChart,
    ]);

    let chart: EChartsType;

    export let data: number[][] | null = null;

    let options: EChartsOption = {};

    function computeOptions() {
        if (!data || data.length <= 0) return {};
        const currentHour = new Date().getHours();
        const currentHourUtc = new Date().getUTCHours();
        const hourDiff = currentHour - currentHourUtc;
        const hours = Array(24)
            .fill(0)
            .map((_, i) => {
                const hour = (i + hourDiff + 24) % 24;
                if (hour === 0) return "12a";
                if (hour < 12) return `${hour}a`;
                if (hour === 12) return "12p";
                return `${hour - 12}p`;
            });
        const days = [
            "Saturday",
            "Friday",
            "Thursday",
            "Wednesday",
            "Tuesday",
            "Monday",
            "Sunday",
        ];
        const maxValue = Math.max(...data.map((d) => d[2]));
        options = {
            polar: {},
            tooltip: {},
            visualMap: {
                type: "continuous",
                min: 0,
                max: maxValue,
                top: "middle",
                dimension: 2,
                calculable: true,
                show: false,
                color: $dark
                    ? ["rgba(103, 232, 249, 1)", "rgba(103, 232, 249, 0.1)"]
                    : ["rgba(6, 182, 212, 1)", "rgba(6, 182, 212, 0.1)"],
            },
            angleAxis: {
                type: "category",
                data: hours,
                boundaryGap: false,
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: "#ddd",
                        type: "dashed",
                    },
                },
                axisLine: {
                    show: false,
                },
            },
            radiusAxis: {
                type: "category",
                data: days,
                z: 100,
                show: false,
            },
            series: [
                {
                    name: "Punch Card",
                    type: "custom",
                    coordinateSystem: "polar",
                    itemStyle: {
                        color: "#d14a61",
                    },
                    renderItem: function (params, api) {
                        var values = [api.value(0), api.value(1)];
                        var coord = api.coord(values);
                        var size = api.size!([1, 1], values) as number[];
                        return {
                            type: "sector",
                            shape: {
                                cx: (params.coordSys as any).cx,
                                cy: (params.coordSys as any).cy,
                                r0: coord[2] - size[0] / 2,
                                r: coord[2] + size[0] / 2,
                                startAngle: -(coord[3] + size[1] / 2),
                                endAngle: -(coord[3] - size[1] / 2),
                            },
                            style: api.style({
                                fill: api.visual("color"),
                            }),
                        };
                    },
                    data: data,
                },
            ],
        };
    }

    $: data, computeOptions();
</script>

<div class="w-full h-full flex flex-row items-center justify-center">
    {#if data}
        <div transition:blur class="w-full h-full">
            <Chart bind:chart {init} {options} />
        </div>
    {:else}
        <Loader2 class="animate-spin" />
    {/if}
</div>
