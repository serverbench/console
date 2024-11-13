<script lang="ts">
    import SimplePicker from "./SimplePicker.svelte";

    export let name: string,
        value: number | null = null,
        disabled = false;

    let values = () => {
        let v: [number, string][] = [];
        for (let i = 0; i < 24; i++) {
            v.push([i * 3600, `${i}:00`]);
        }
        return v;
    };
</script>

<SimplePicker {disabled} bind:value {name} items={values()} />
