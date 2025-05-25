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
    import OnlineMembers from "./OnlineMembers.svelte";
    import SimplePicker from "$lib/components/sb/picker/SimplePicker.svelte";
    import { CandlestickChart } from "echarts/charts";
    import { Switch } from "$lib/components/ui/switch";
    import Label from "$lib/components/ui/label/label.svelte";
    import { Loader2 } from "lucide-svelte";
    use([
        LineChart,
        BarChart,
        GridComponent,
        CanvasRenderer,
        TitleComponent,
        LegendComponent,
        TooltipComponent,
        CandlestickChart,
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
        total: {
            min: number;
            avg: number;
            max: number;
        };
    };

    type ComparedDataPoint = {
        current: DataPoint;
        previous: DataPoint;
    };

    let data: DataPoint[] = [];
    let comparedData: ComparedDataPoint[] = [];

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

    $: data, comparedData, computeOptions();

    let compare = true;

    function getRegularOptions() {
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

    function getComparedOptions() {
        options = {
            legend: {
                data: ["gains", "loses"],
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
                type: "value",
            },
            series: [
                {
                    name: "total/avg",
                    type: "candlestick",
                    label: {
                        show: true,
                        position: "bottom",
                    },
                    data: (() => {
                        let values: [number, number, number, number][] = [];
                        for (const point of comparedData) {
                            const currentTotal = point.current.total.max;
                            const pastTotal = point.previous.total.max;
                            const currentAvg = point.current.total.avg;
                            const pastAvg = point.previous.total.avg;
                            values.push([
                                currentTotal,
                                pastTotal,
                                currentTotal,
                                pastTotal,
                            ]);
                        }
                        return values;
                    })(),
                },
            ],
        };
    }

    function computeOptions() {
        if (!compare) {
            return getRegularOptions();
        } else {
            return getComparedOptions();
        }
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
        load();
    });

    let resolutions = [
        [{ resolution: 30, blocks: 48 }, "24h"],
        [{ resolution: 2, blocks: 30 }, "1h"],
        [{ resolution: 60, blocks: 168 }, "1w"],
        [{ resolution: 60 * 6, blocks: (24 * 30) / 6 }, "1mo"],
        [{ resolution: 60 * 24, blocks: 30 * 4 }, "4mo"],
    ] as [any, string][];

    let resolution = resolutions[2][0];

    $: resolution, load(loadedResolution != resolution);
    $: compare, load(true);

    let loadedResolution = resolutions[0][0];

    let firstLoad = false;

    async function load(reset = false) {
        firstLoad = reset;
        loadedResolution = resolution;
        const user = await User.get();
        const community = await Community.get();
        if (!compare) {
            data = await user!.post(`/community/${community!.id}/count`, {
                resolution: resolution.resolution,
                blocks: resolution.blocks,
            });
        } else {
            comparedData = await user!.post(
                `/community/${community!.id}/count/compare`,
                {
                    resolution: resolution.resolution,
                    blocks: resolution.blocks,
                },
            );
        }
        firstLoad = false;
    }
</script>

<div class="h-96 w-full border flex flex-col gap-5 pt-5 relative">
    {#if firstLoad}
        <div
            class="absolute top-0 left-0 w-full h-full flex items-center justify-center"
        >
            <Loader2 class="animate-spin" />
        </div>
    {/if}
    <div class="h-full w-full transition" class:opacity-0={firstLoad}>
        <Chart
            bind:chart
            {init}
            {options}
            on:legendselectchanged={handleLegendSelect}
        />
    </div>
    <div
        class="absolute top-0 w-full pt-5 px-5 flex flex-row gap-5 items-center justify-between"
    >
        <div class="flex flex-row gap-2 items-center">
            <Switch id="compare" bind:checked={compare} />
            <Label for="compare">Compare</Label>
        </div>
        <div>
            <SimplePicker
                bind:value={resolution}
                items={resolutions}
                name="Resolution"
            />
        </div>
    </div>
</div>

<OnlineMembers on:update={() => load()} />
