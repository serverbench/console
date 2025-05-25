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
    import type { CountryCount } from "$lib/sb/member/Connection";

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

    export let countries: CountryCount[] = [];

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
                data: countries.map((country) => ({
                    name: country.country,
                    value: Number(country.total),
                    children: [
                        ...(country.idle
                            ? [
                                  {
                                      name: "Idle",
                                      value: Number(country.idle),
                                  },
                              ]
                            : []),
                        ...(country.total - country.idle > 0
                            ? [
                                  {
                                      name: "Active",
                                      value: Number(
                                          country.total - country.idle,
                                      ),
                                  },
                              ]
                            : []),
                    ],
                })),
                label: {
                    show: false,
                },
            },
        };
    }

    $: countries, computeOptions();
</script>

<Chart bind:chart {init} {options} />
