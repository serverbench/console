<script>
    import Roles from "./Roles.svelte";
    import Team from "./Team.svelte";

    let k = 0;
</script>

<Roles on:invite={() => k++} />
{#key k}
    <Team />
{/key}
