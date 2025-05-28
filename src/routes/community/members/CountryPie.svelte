<script lang="ts">
    import { Chart } from "svelte-echarts";
    import { init, use } from "echarts/core";
    import { BarChart, LineChart, TreemapChart } from "echarts/charts";
    import {
        AriaComponent,
        GridComponent,
        LegendComponent,
        TitleComponent,
        TooltipComponent,
    } from "echarts/components";
    import { CanvasRenderer } from "echarts/renderers";
    import type { EChartsOption, EChartsType } from "echarts";
    import type { CountryCount } from "$lib/sb/member/Connection";

    use([
        LineChart,
        BarChart,
        GridComponent,
        CanvasRenderer,
        TitleComponent,
        LegendComponent,
        TooltipComponent,
        TreemapChart,
        AriaComponent,
    ]);

    let chart: EChartsType;

    export let countries: CountryCount[] = [];

    let options: EChartsOption = {};

    function getFlagURL(code: string): string {
        return `image://https://flagcdn.com/w40/${code.toLowerCase()}.svg`;
    }

    function computeOptions() {
        options = {
            tooltip: {
                show: true,
                trigger: "item",
                formatter: "{b}: {c}",
            },
            series: {
                type: "sunburst",
                radius: [60, '90%'],
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
            aria: {
                enabled: true,
                decal: {
                    show: true,
                },
            },
        };
    }

    $: countries, computeOptions();
</script>

<Chart bind:chart {init} {options} />
