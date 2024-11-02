<script lang="ts">
    import SimplePicker from "./SimplePicker.svelte";
    export let disabled = false,
        value: string | null = null;
</script>

<SimplePicker
    items={[
        [null, "one-time"],
        ["month", "monthly"],
        ["year", "yearly"],
    ]}
    name="Frequency"
    {disabled}
    bind:value
/>
