<script lang="ts">
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";

    export let example: string = "value";
</script>

<div class="inline-block">
    <Tooltip.Root>
        <Tooltip.Trigger>
            <Badge variant="secondary" class="inline px-1 rounded-none">
                {"{"}<slot />{"}"}
            </Badge>
        </Tooltip.Trigger>
        <Tooltip.Content>
            <p>{example}</p>
        </Tooltip.Content>
    </Tooltip.Root>
</div>
