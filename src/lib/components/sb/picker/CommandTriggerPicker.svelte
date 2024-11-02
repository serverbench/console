<script lang="ts">
    import type { CommandTrigger } from "$lib/sb/store/sku/perk/PerkCmd";
    import SimplePicker from "./SimplePicker.svelte";

    export let disabled = false,
        value: CommandTrigger;
</script>

<SimplePicker
    name="Trigger"
    bind:value
    bind:disabled
    items={[
        ["acquire", "acquire"],
        ["renew", "renew"],
        ["terminated", "terminated"],
    ]}
/>
