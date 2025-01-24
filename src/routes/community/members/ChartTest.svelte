<script lang="ts">
    import { Chart } from "svelte-echarts";
    import { init, use } from "echarts/core";
    import { BarChart, LineChart } from "echarts/charts";
    import {
        GridComponent,
        LegendComponent,
        TitleComponent,
        TooltipComponent,
    } from "echarts/components";
    import { CanvasRenderer } from "echarts/renderers";
    import type { EChartsOption, EChartsType, SeriesOption } from "echarts";
    import type { CallbackDataParams } from "echarts/types/dist/shared";
    import { onMount } from "svelte";
    import User from "$lib/sb/User";
    import Community from "$lib/sb/Community";
    use([
        LineChart,
        BarChart,
        GridComponent,
        CanvasRenderer,
        TitleComponent,
        LegendComponent,
        TooltipComponent,
    ]);

    type DataPoint = {
        created: number;
        active: {
            min: number;
            avg: number;
            max: number;
        };
        idle: {
            min: number;
            avg: number;
            max: number;
        };
    };

    let data: DataPoint[] = [];

    let resolution = 10

    function getBands(
        selector: "active" | "idle",
        color: string,
        lineOpacity = 1,
        areaOpacity = 0.15,
    ): SeriesOption[] {
        return [
            {
                tooltip: {
                    show: false,
                },
                name: selector,
                type: "line",
                data: data.map(() => -100),
                lineStyle: {
                    opacity: 0,
                },
                color: color,
            },
            {
                name: `${selector} gap`,
                id: `${selector}-gap`,
                tooltip: {
                    show: false,
                },
                type: "line",
                data: data.map((i) => {
                    if (selector == "active") {
                        return i.active.min;
                    } else {
                        return i.idle.min;
                    }
                }),
                showSymbol: false,
                lineStyle: {
                    opacity: 0,
                },
                stack: "acc",
            },
            {
                name: `${selector} minimum`,
                id: `${selector}-min`,
                type: "line",
                data: data.map(() => {
                    return 0;
                }),
                lineStyle: {
                    opacity: 0,
                },
                stack: "acc",
                symbol: "none",
            },
            {
                name: `${selector} average`,
                id: `${selector}-avg`,
                type: "line",
                data: data.map((i) => {
                    if (selector == "active") {
                        return i.active.avg - i.active.min;
                    } else {
                        return i.idle.avg - i.idle.min;
                    }
                }),
                lineStyle: {
                    color,
                    opacity: lineOpacity,
                },
                areaStyle: {
                    color,
                    opacity: areaOpacity,
                },
                itemStyle: {
                    color,
                },
                showSymbol: false,
                stack: "acc",
            },
            {
                name: `${selector} maximum`,
                id: `${selector}-max`,
                type: "line",
                data: data.map((i) => {
                    if (selector == "idle") {
                        return i.idle.max - i.idle.avg;
                    } else {
                        return i.active.max - i.active.avg;
                    }
                }),
                lineStyle: {
                    opacity: 0,
                },
                areaStyle: {
                    color,
                    opacity: areaOpacity,
                },
                stack: "acc",
                symbol: "none",
            },
        ];
    }

    let options: EChartsOption = {};

    $: data, computeOptions();

    function computeOptions() {
        options = {
            legend: {
                data: ["active", "idle"],
            },
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "cross",
                    animation: false,
                    label: {
                        backgroundColor: "#ccc",
                        borderColor: "#aaa",
                        borderWidth: 1,
                        shadowBlur: 0,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                        color: "#222",
                    },
                },
            },
            xAxis: {
                type: "category",
                data: data.map((d) => new Date(d.created * 1000) as any),
                boundaryGap: false,
            },
            yAxis: {
                splitNumber: 3,
                min: 0,
            },
            series: [
                ...getBands("idle", "#fcca03", 1, 0.3),
                ...getBands("active", "#00ff95", 1, 0.2),
            ],
        };
    }

    let chart: EChartsType;
    function handleLegendSelect(e: CustomEvent<CallbackDataParams>) {
        console.log(e);
        const detail = e.detail as any;
        const main = ["active", "idle"];
        if (!main.includes(detail.name)) return;
        highlight(detail.name, detail.selected[detail.name]);
    }

    function highlight(key: string, show: boolean) {
        const related = ["gap", "minimum", "average", "maximum"];
        related.map((r) => {
            let action = {
                type: show ? "legendSelect" : "legendUnSelect",
                name: `${key} ${r}`,
            };
            console.log(action);
            chart.dispatchAction(action);
        });
    }

    onMount(async () => {
        load()
    });

    $: resolution, load()

    async function load(){
        const user = await User.get();
        const community = await Community.get();
        data = await user!.post(`/community/${community!.id}/count`, {
            resolution,
        });
    }
</script>

<div class="h-96 w-full border flex flex-col gap-5 py-5 items-center">
    <Chart
        bind:chart
        {init}
        {options}
        on:legendselectchanged={handleLegendSelect}
    />
    <input type="number" bind:value={resolution} />
</div>
