<script lang="ts">
    import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
    import ChartTest from "./ChartTest.svelte";

    let span: number = 60 * 24;
    let resolution: number = 15;
</script>

<ChartTest />
