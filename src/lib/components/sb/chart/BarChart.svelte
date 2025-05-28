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
        AriaComponent,
    } from "echarts/components";
    import { CanvasRenderer } from "echarts/renderers";
    import { onMount } from "svelte";
    import moment from "moment";
    import { Loader2 } from "lucide-svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import SimplePicker from "../picker/SimplePicker.svelte";

    use([
        BarChart,
        GridComponent,
        CanvasRenderer,
        TitleComponent,
        LegendComponent,
        TooltipComponent,
        AriaComponent,
    ]);

    let range: [Date, Date] | null = null;
    let selectableRange: [any, string][] = [];

    export let name: string;
    let options: EChartsOption | null = null;
    export let provider: (from: Date, to: Date) => Promise<EChartsOption>;

    async function reload() {
        if (!range) return;
        options = null;
        const newOptions = await provider(
            new Date(range[0]),
            new Date(range[1]),
        );
        newOptions.animationDuration = 400;
        newOptions.animationEasing = "circularOut";
        options = newOptions;
    }

    onMount(async () => {
        selectableRange = [
            [[moment().startOf("month").toDate(), new Date()], "This Month"],
            [[moment().startOf("year").toDate(), new Date()], "This Year"],
            [
                [
                    moment().subtract(1, "month").startOf("month").toDate(),
                    moment().subtract(1, "month").endOf("month").toDate(),
                ],
                "Last Month",
            ],
            [
                [
                    moment().subtract(1, "year").startOf("year").toDate(),
                    moment().subtract(1, "year").endOf("year").toDate(),
                ],
                "Last Year",
            ],
        ];
        range = selectableRange[0][0];
        await reload();
    });

    $: range, reload();
</script>

<div class="border h-96 relative">
    {#if options}
        <div class="pt-7 h-full">
            <Chart {init} {options} />
        </div>
    {:else}
        <div class="flex flex-row w-full items-center justify-center h-full">
            <Loader2 class="animate-spin" />
        </div>
    {/if}
    <div class="mt-3 px-3 flex flex-row justify-between absolute top-0 w-full">
        <span
            class="text-sm border px-3 flex flex-col items-center justify-center bg-white dark:bg-black dark:bg-opacity-50 bg-opacity-50 backdrop-blur-md"
        >
            {name}
        </span>
        <div class="grow max-w-44">
            {#key selectableRange}
                <SimplePicker
                    bind:value={range}
                    name="Range"
                    items={selectableRange}
                />
            {/key}
        </div>
    </div>
</div>
