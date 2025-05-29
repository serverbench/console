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

    export let data: number[][] = [];

    let options: EChartsOption = {};

    function computeOptions() {
        if(data.length == 0) return {}
        const hours = [
            "12a",
            "1a",
            "2a",
            "3a",
            "4a",
            "5a",
            "6a",
            "7a",
            "8a",
            "9a",
            "10a",
            "11a",
            "12p",
            "1p",
            "2p",
            "3p",
            "4p",
            "5p",
            "6p",
            "7p",
            "8p",
            "9p",
            "10p",
            "11p",
        ];
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
                show: false
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
                show: false
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

<Chart bind:chart {init} {options} />
