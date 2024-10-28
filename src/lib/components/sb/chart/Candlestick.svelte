<script lang="ts">
    import moment from "moment";
    import { onMount } from "svelte";

    export let span: number;
    export let resolution: number;

    const minv = 20;
    const variability = 30;
    const maxv = 100;

    onMount(async () => {
        const data: {
            x: Date;
            y: number[];
        }[] = (() => {
            let data = [];
            const now = new Date().setMinutes(0);
            for (let i = span; i > 0; i -= resolution) {
                const open =
                    Math.abs(
                        Math.random() * Math.sin((i / (24 * 60)) * 4) * maxv,
                    ) +
                    minv +
                    Math.random() * variability;
                const close =
                    Math.abs(
                        Math.random() * Math.sin((i / (24 * 60)) * 4) * maxv,
                    ) +
                    minv +
                    Math.random() * variability;
                const max = open > close ? open : close;
                const min = close > open ? open : close;
                const top = Math.abs(max - Math.random() * variability);
                const bottom = Math.abs(min + Math.random() * variability);
                const finalTop = top > max ? max : top;
                const finalBottom = bottom < min ? min : bottom;
                data.push({
                    x: new Date(now - i * 60 * 1000),
                    y: [
                        Math.trunc(open),
                        Math.trunc(
                            finalBottom > finalTop ? finalBottom : finalTop,
                        ),
                        Math.trunc(
                            finalTop > finalBottom ? finalBottom : finalTop,
                        ),
                        Math.trunc(close),
                    ],
                });
            }
            return data;
        })();
        const ApexCharts = (await import("apexcharts")).default;
        new ApexCharts(chart, {
            series: [
                {
                    name: "candle",
                    data,
                },
            ],
            chart: {
                toolbar: {
                    show: false,
                },
                animations: {
                    enabled: false,
                },
                height: 350,
                type: "candlestick",
            },
            tooltip: {
                enabled: true,
            },
            xaxis: {
                type: "category",
                labels: {
                    formatter: function (val: any) {
                        return moment(val).format("DD HH:mm");
                    },
                },
            },
            yaxis: {
                tooltip: {
                    enabled: true,
                },
            },
        }).render();
    });

    let chart: HTMLDivElement;
</script>

<div bind:this={chart} />
