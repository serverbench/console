<script lang="ts">
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import List from "$lib/components/sb/section/list/list.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Community from "$lib/sb/Community";
    import { onMount } from "svelte";
    import Key from "./Key.svelte";
    import Section from "$lib/components/sb/section/section.svelte";

    let pk: string | null = null;
    let sk: string | null = null;
    let loading = false;

    onMount(async () => {
        loading = true;
        try {
            const keys = await (await Community.get())!.getKeys();
            pk = keys.pk;
            sk = keys.sk;
        } catch (e) {
            console.error(e);
        }
        loading = false;
    });
</script>

<Section name="Keys" list used={1}>
    <Key key={pk} />
    <Key key={sk} secret />
</Section>
