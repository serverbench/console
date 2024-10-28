<script lang="ts">
    import { Progress } from "$lib/components/ui/progress";
    import { ArrowUp } from "lucide-svelte";
    import * as Tooltip from "$lib/components/ui/tooltip";
    export let max: number, used: number;
</script>

<div class="flex flex-row items-center gap-2">
    {used} of {max} used
    <div class="w-24">
        <Progress {max} value={used} />
    </div>

    <Tooltip.Root>
        <Tooltip.Trigger>
            <div
                class="relative inline-flex overflow-hidden rounded-full p-px group"
            >
                <span
                    class:opacity-0={used / max < 0.8}
                    class="absolute inset-[-1000%] group-hover:opacity-100 transition-opacity animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#c2c2c2_0%,#505050_50%,#bebebe_100%)]"
                />
                <span
                    class="inline-flex h-full w-full items-center justify-center rounded-full bg-neutral-950 p-2 text-xs font-medium text-gray-50 backdrop-blur-3xl"
                >
                    <ArrowUp />
                </span>
            </div>
        </Tooltip.Trigger>
        <Tooltip.Content>Upgrade</Tooltip.Content>
    </Tooltip.Root>
</div>
