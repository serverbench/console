<script lang="ts">
    import { Binoculars, Pen } from "lucide-svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import Switch from "$lib/components/ui/switch/switch.svelte";

    export let write: boolean = false;
</script>

<div class="flex flex-row gap-2 items-center border p-2 rounded-lg">
    <Label>
        <Binoculars />
    </Label>
    <Switch bind:checked={write} />
    <Label>
        <Pen />
    </Label>
</div>
