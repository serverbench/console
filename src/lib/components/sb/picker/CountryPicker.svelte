<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Select from "$lib/components/ui/select/index.js";
    import type { Selected } from "bits-ui";
    import countryCodes from "i18n-iso-countries";
    import countriesEn from "i18n-iso-countries/langs/en.json";
    import { CircleX, X } from "lucide-svelte";
    countryCodes.registerLocale(countriesEn);
    const countries = Object.keys(countryCodes.getAlpha2Codes()).map((c) => {
        return {
            value: c,
            label: countryCodes.getName(c, "en") ?? c,
        };
    });

    export let value: string | null = null;
    export let disabled = false;
    let selected: Selected<string | null> = {
        value: value,
        label: countries.find((c) => c.value == value)?.label ?? "",
    };
</script>

<div class="flex flex-row gap-2">
    <Select.Root
        onSelectedChange={(v) => {
            if (!v?.value || v.value == "") {
                value = null;
                selected = { value: null };
            } else {
                value = v.value;
            }
        }}
        bind:selected
    >
        <Select.Trigger {disabled} class="w-full">
            <Select.Value placeholder="Country" />
        </Select.Trigger>
        <Select.Content class="max-h-40 overflow-y-auto">
            <Select.Group>
                <Select.Label>Countries</Select.Label>
                {#each countries as country}
                    <Select.Item value={country.value} label={country.label}>
                        {country.label}
                    </Select.Item>
                {/each}
            </Select.Group>
        </Select.Content>
        <Select.Input name="favoriteFruit" />
    </Select.Root>
    {#if value != null}
        <Button
            class="aspect-square"
            on:click={() => (selected = { value: "" })}
            variant="outline"
            size="icon"
            {disabled}
        >
            <X />
        </Button>
    {/if}
</div>
