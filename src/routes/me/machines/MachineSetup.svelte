<script lang="ts">
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import Machine from "$lib/sb/machine/Machine";
    import * as Alert from "$lib/components/ui/alert";
    import { onMount } from "svelte";
    import { Loader2 } from "lucide-svelte";
    export let machine: Machine;

    let sk: string | null = null;

    onMount(async () => {
        await loadKeys()
    });

    async function loadKeys() {
        sk = (await machine.getKeys()).sk;
    }

    $: machine, loadKeys()
</script>

<div class="flex flex-col gap-2">
    {#if !machine.hardware?.hostname}
        <Alert.Root>
            <Alert.Description>
                Please, run the following command on your machine to finish setting it up
            </Alert.Description>
        </Alert.Root>
    {/if}
    {#if sk}
        <Textarea
            value={`curl -fsSL https://get.serverbench.io | sh -s -- "${sk}"`}
            readonly
        />
    {:else}
        <Loader2 class="animate-spin mx-auto my-3" />
    {/if}
</div>
