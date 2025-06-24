<script lang="ts">
    import * as Select from "$lib/components/ui/select/index.js";
    import type { Selected } from "bits-ui";
    import { createEventDispatcher } from "svelte";

    const dispatcher = createEventDispatcher()

    export let items: [any, string][] | [any, string, string][],
        name: string,
        optional: string | null = null,
        disabled = false,
        images = false,
        value: any | null = null;

    const baseSelectable = optional
        ? [
              {
                  value: null,
                  label: optional,
                  image: null,
              },
          ]
        : [];
    const selectable = [
        ...baseSelectable,
        ...items.map((c) => {
            return {
                value: c[0],
                label: c[1],
                image: c[2] ?? null,
            };
        }),
    ];

    let selected: Selected<any> = {
        value: value,
        label: selectable.find((f) => f.value == value)?.label ?? "",
    };

    $: value, dispatcher('change', value)

    $: selectedImage = () => {
        const found = selectable.find((f) => f.value == value);
        return found ? found.image : null;
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
    <Select.Trigger {disabled} class="w-full flex flex-row items-center gap-2">
        {#if images && selectedImage()}
            <div
                class="h-6 w-6"
                style:background-image={`url(${selectedImage()})`}
                style="background-size: contain; background-position: center; background-repeat: no-repeat;"
            />
        {/if}
        <Select.Value placeholder={name} />
    </Select.Trigger>
    <Select.Content class="max-h-40 overflow-y-auto">
        <Select.Group>
            <Select.Label class="capitalize">{name}</Select.Label>
            {#each selectable as select, i}
                {#if optional && i == 1}
                    <Select.Separator />
                {/if}
                <Select.Item class="flex flex-row gap-2 items-center" value={select.value} label={select.label ?? ""}>
                    {#if images && select.value && select.image}
                        <div
                            class="h-6 w-6"
                            style:background-image={`url(${select.image})`}
                            style="background-size: contain; background-position: center; background-repeat: no-repeat;"
                        />
                    {/if}
                    {select.label}
                </Select.Item>
            {/each}
        </Select.Group>
    </Select.Content>
    <Select.Input {name} />
</Select.Root>
