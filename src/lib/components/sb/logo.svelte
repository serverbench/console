<script lang="ts">
    import { Badge } from "$lib/components/ui/badge";
    export let center = false,
        big = false,
        inline = false;
</script>

<div class:inline-block={inline}>
    <div
        class:mx-auto={center}
        class:text-center={center}
        class:text-xl={big}
        class:justify-center={center}
        class="flex flex-row gap-1 items-center"
    >
        <span class="font-semibold">serverbench</span>
        <Badge variant="outline">beta</Badge>
    </div>
</div>
