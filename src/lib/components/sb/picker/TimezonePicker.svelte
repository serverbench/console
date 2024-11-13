<script lang="ts">
    import SimplePicker from "./SimplePicker.svelte";
    import timezones from "timezones-list";

    export let value: string | null = null,
        name: string = "Timezone",
        disabled = false;
</script>

<SimplePicker
    optional="UTC"
    items={timezones.map((t) => [t.tzCode, t.label])}
    {name}
    {disabled}
    bind:value
/>
