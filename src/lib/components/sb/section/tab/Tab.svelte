<script lang="ts">
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    export let name: string,
        tab: string | null = null;
</script>

{#if tab == null || tab == name}
    <Tabs.Content class="flex flex-col mt-0 gap-3 p-3" value={name}>
        <slot />
    </Tabs.Content>
{/if}
