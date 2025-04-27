<script lang="ts">
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import Section from "$lib/components/sb/section/section.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Machine from "$lib/sb/machine/Machine";
    import { Loader2 } from "lucide-svelte";
    import { onMount } from "svelte";
    import MachineRow from "./MachineRow.svelte";

    let machines: Machine[] = [];
    let loading = true;
    let justCreated: string | null = null;

    onMount(async () => {
        loading = true;
        try {
            machines = await Machine.list();
        } catch (error) {
        } finally {
            loading = false;
        }
    });

    async function createMachine() {
        loading = true;
        try {
            const machine = await Machine.create();
            justCreated = machine.id;
            machines = [...machines, machine];
        } catch (error) {
            console.error(error);
        } finally {
            loading = false;
        }
    }
</script>

<Section name="machines" list used={machines.length}>
    <div slot="add">
        <Button
            class="w-full"
            disabled={loading}
            on:click={() => createMachine()}
        >
            {#if loading}
                <Loader2 class="animate-spin" />
            {:else}
                Create Machine
            {/if}
        </Button>
    </div>
    {#each machines as machine}
        <MachineRow setup={machine.id==justCreated} {machine} />
    {/each}
</Section>
