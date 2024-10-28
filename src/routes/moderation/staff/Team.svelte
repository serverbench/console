<script lang="ts">
    import Section from "$lib/components/sb/section/section.svelte";
    import Invite from "$lib/sb/staff/Invite";
    import Staff from "$lib/sb/staff/Staff";
    import CStaff from "./Staff.svelte";
    import { onMount } from "svelte";

    let invites: Invite[] = [];
    let staff: Staff[] = [];
    let loading = false;

    onMount(async () => {
        loading = true;
        try {
            [invites, staff] = await Promise.all([Invite.list(), Staff.list()]);
        } catch (error) {}
        loading = false;
    });
</script>

<Section
    list
    {loading}
    name="team"
    used={invites.length + staff.length}
    limit={15}
>
    {#each invites as invite}
        <CStaff
            on:delete={() => {
                invites = invites.filter((i) => i.id != invite.id);
            }}
            {invite}
        />
    {/each}
    {#each staff as s}
        <CStaff
            on:delete={() => {
                staff = staff.filter((i) => i.id != s.id);
            }}
            staff={s}
        />
    {/each}
</Section>
