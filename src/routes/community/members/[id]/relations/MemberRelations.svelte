<script lang="ts">
    import type Member from "$lib/sb/member/Member";
    import type { Relation } from "$lib/sb/member/Member";
    import { onMount } from "svelte";
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
    import type { EChartsOption } from "echarts";
    import { SunburstChart } from "echarts/charts";
    import { Loader2 } from "lucide-svelte";
    import { blur } from "svelte/transition";
    import { Chart } from "svelte-echarts";

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

    let relations: Relation[];
    export let member: Member | null;
    let loading = false;

    async function load() {
        relations = [];
        data = null;
        if (!member) return;
        loading = true;
        relations = await member.getChatRelations();
        data = {
            nodes: relations.map((relation) => ({
                id: relation.member.id,
                name: relation.member.name,
                symbolSize: 10 + relation.weight * 2,
                value: relation.weight,
                category: getCategory(relation),
            })),
            links: relations.flatMap(
                (relation) =>
                    relation.to?.map((to) => ({
                        source: relation.member.id,
                        target: to.member.id,
                    })) || [],
            ),
            categories: [
                { name: "0-25%" },
                { name: "25-50%" },
                { name: "50-75%" },
                { name: "75-90%" },
                { name: "90-100%" },
            ],
        };
        loading = false;
    }
    let data: {
        nodes: {
            id: string;
            name: string;
            symbolSize: number;
            value: number;
            category: string;
        }[];
        links: {
            source: string;
            target: string;
        }[];
        categories: {
            name: string;
        }[];
    } | null = null;

    function getCategory(relation: Relation): string {
        // based on the percentile it should return one of 4 percentiles
        // first, we must compute the percentiles themselves
        const weights = relations.map((r) => r.weight);
        const sortedWeights = [...weights].sort((a, b) => a - b);
        const percentiles = [
            sortedWeights[Math.floor(sortedWeights.length * 0.25)],
            sortedWeights[Math.floor(sortedWeights.length * 0.5)],
            sortedWeights[Math.floor(sortedWeights.length * 0.75)],
            sortedWeights[Math.floor(sortedWeights.length * 0.9)],
        ];
        const weight = relation.weight;
        if (weight < percentiles[0]) return "0-25%";
        if (weight < percentiles[1]) return "25-50%";
        if (weight < percentiles[2]) return "50-75%";
        if (weight < percentiles[3]) return "75-90%";
        return "90-100%";
    }

    function options(): EChartsOption {
        return {
            tooltip: {},
            legend: data
                ? [
                      {
                          data: data.categories.map(function (a) {
                              return a.name;
                          }),
                      },
                  ]
                : [],
            animationDurationUpdate: 1500,
            animationEasingUpdate: "quinticInOut",
            series: [
                {
                    type: "graph",
                    layout: "circular",
                    circular: {
                        rotateLabel: true,
                    },
                    data: data?.nodes ?? [],
                    links: data?.links ?? [],
                    categories: data?.categories ?? [],
                    roam: true,
                    label: {
                        position: "right",
                        formatter: "{b}",
                    },
                    lineStyle: {
                        color: "source",
                        curveness: 0.3,
                    },
                },
            ],
        };
    }

    onMount(async () => {
        await load();
    });
    $: member, load();
</script>

<div class="w-full h-full flex flex-row items-center justify-center">
    {#if data}
        <div transition:blur class="w-full h-full">
            <Chart {init} options={options()} />
        </div>
    {:else}
        <Loader2 class="animate-spin" />
    {/if}
</div>
