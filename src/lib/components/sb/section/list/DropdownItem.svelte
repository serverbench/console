<script lang="ts">
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    export let destructive = false;
</script>

<DropdownMenu.Item
    class={destructive ? "destructive" : ""}
    on:click={() => dispatch("click")}
>
    <slot />
</DropdownMenu.Item>
