<script lang="ts">
    import Branding from "$lib/sb/branding/Branding";
    import { onMount } from "svelte";
    import Colors from "./Colors.svelte";
    import Image from "./Image.svelte";
    import List from "$lib/components/sb/section/list/list.svelte";

    let loading = false;
    let branding: Branding | null = null;

    onMount(async () => {
        loading = true;
        try {
            branding = await Branding.get();
        } catch (error) {}
        loading = false;
    });
</script>

{#key branding}
    <Colors bind:loading {branding} />
    <List>
        {#each ["iso", "logo", "banner", "background"] as type}
            <Image bind:loading {branding} {type} />
        {/each}
    </List>
{/key}
