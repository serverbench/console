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
    import type { EChartsOption, EChartsType } from "echarts";
    import { SunburstChart } from "echarts/charts";
    import type {
        CountryCount,
        InstanceCount,
    } from "$lib/sb/member/Connection";

    use([
        LineChart,
        BarChart,
        GridComponent,
        CanvasRenderer,
        TitleComponent,
        LegendComponent,
        TooltipComponent,
        SunburstChart,
    ]);

    let chart: EChartsType;

    export let instances: InstanceCount[] = [];

    let options: EChartsOption = {};

    function computeOptions() {
        options = {
            tooltip: {
                show: true,
                trigger: "item",
                formatter: "{b}: {c}",
            },
            series: {
                type: "sunburst",
                data: instances.map((instance) => {
                    return {
                        name: instance.server,
                        value: instance.instances.reduce(
                            (sum, i) => sum + Number(i.count),
                            0,
                        ),
                        children: instance.instances.map((i) => ({
                            name: i.name,
                            value: Number(i.count),
                        })),
                    };
                }),
                label: {
                    show: false,
                },
            },
        };
    }

    $: instances, computeOptions();
</script>

<Chart bind:chart {init} {options} />
