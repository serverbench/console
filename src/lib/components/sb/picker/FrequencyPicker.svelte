<script lang="ts">
    import * as Select from "$lib/components/ui/select/index.js";
    import type { Selected } from "bits-ui";
    const frequencies = [
        [null, "one-time"],
        ["month", "monthly"],
        ["year", "yearly"],
    ].map((c) => {
        return {
            value: c[0],
            label: c[1],
        };
    });

    export let disabled = false;
    export let value: string | null = null;
    let selected: Selected<string | null> = {
        value: value,
        label: frequencies.find((f) => f.value == value)?.label ?? "",
    };
</script>

<Select.Root
    onSelectedChange={(v) => {
        if (!v?.value || v.value == "") {
            value = null;
        } else {
            value = v.value;
        }
    }}
    bind:selected
>
    <Select.Trigger {disabled} class="w-full">
        <Select.Value placeholder="Frequency" />
    </Select.Trigger>
    <Select.Content class="max-h-40 overflow-y-auto">
        <Select.Group>
            <Select.Label>Frequencies</Select.Label>
            {#each frequencies as frequency}
                <Select.Item
                    value={frequency.value}
                    label={frequency.label ?? ""}
                >
                    {frequency.label}
                </Select.Item>
            {/each}
        </Select.Group>
    </Select.Content>
    <Select.Input name="favoriteFruit" />
</Select.Root>
