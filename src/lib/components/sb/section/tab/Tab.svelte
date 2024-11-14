<script lang="ts">
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    export let name: string,
        selected: string | null = null;
</script>

{#if selected == name}
    <Tabs.Content class="flex flex-col gap-3 p-3 mt-0" value={name}>
        <slot />
    </Tabs.Content>
{/if}
