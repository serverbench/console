<script lang="ts">
    import type Role from "$lib/sb/staff/Role";
    import Roles from "./Roles.svelte";
    import Team from "./Team.svelte";

    let roles: Role[] = [];
    let k = 0;
</script>

<Roles bind:roles on:invite={() => k++} />
{#if roles.length > 0}
    {#key k}
        <Team />
    {/key}
{/if}
