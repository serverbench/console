<script lang="ts">
    import * as Select from "$lib/components/ui/select/index.js";
    import type { Selected } from "bits-ui";
    export let items: [any, string][],
        name: string,
        optional: string | null = null,
        disabled = false,
        value: any | null = null;

    const baseSelectable = optional
        ? [
              {
                  value: null,
                  label: optional,
              },
          ]
        : [];
    const selectable = [
        ...baseSelectable,
        ...items.map((c) => {
            return {
                value: c[0],
                label: c[1],
            };
        }),
    ];

    let selected: Selected<any> = {
        value: value,
        label: selectable.find((f) => f.value == value)?.label ?? "",
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
        <Select.Value placeholder={name} />
    </Select.Trigger>
    <Select.Content class="max-h-40 overflow-y-auto">
        <Select.Group>
            <Select.Label class="capitalize">{name}</Select.Label>
            {#each selectable as select, i}
                {#if optional && i == 1}
                    <Select.Separator />
                {/if}
                <Select.Item value={select.value} label={select.label ?? ""}>
                    {select.label}
                </Select.Item>
            {/each}
        </Select.Group>
    </Select.Content>
    <Select.Input {name} />
</Select.Root>
