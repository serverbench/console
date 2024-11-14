<script lang="ts">
    import Input from "$lib/components/ui/input/input.svelte";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import TimePicker from "$lib/components/sb/picker/TimePicker.svelte";
    import TimezonePicker from "$lib/components/sb/picker/TimezonePicker.svelte";

    export let resetScheme: "cooldown" | "fixed" = "cooldown";
    export let cooldown = 0;
    export let reset = 0;
    export let timezone: string | null = null;
    export let disabled = false;
</script>

<Tabs.Root bind:value={resetScheme}>
    <Tabs.List class="grid w-full grid-cols-2">
        <Tabs.Trigger {disabled} value="cooldown">Cooldown</Tabs.Trigger>
        <Tabs.Trigger {disabled} value="fixed">Fixed Time</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="cooldown">
        <div class="flex flex-row gap-3">
            <Input
                min="0"
                max="24"
                bind:value={cooldown}
                type="number"
                placeholder="Cooldown Time (hours)"
                {disabled}
            />
            <Input value="hours" disabled />
        </div>
    </Tabs.Content>
    <Tabs.Content value="fixed">
        <div class="flex flex-row gap-3">
            <TimePicker {disabled} bind:value={reset} name="Reset Time" />
            <TimezonePicker {disabled} bind:value={timezone} />
        </div>
    </Tabs.Content>
</Tabs.Root>
