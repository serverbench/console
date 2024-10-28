<script lang="ts">
    import DropdownItem from "$lib/components/sb/section/list/DropdownItem.svelte";
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import type Invite from "$lib/sb/staff/Invite";
    import type Staff from "$lib/sb/staff/Staff";
    import { Mail, Trash2 } from "lucide-svelte";
    import { createEventDispatcher } from "svelte";

    export let invite: Invite | null = null,
        staff: Staff | null = null;

    const dispatch = createEventDispatcher();

    async function cancelInvite() {
        if (invite == null) return;
        await invite.delete();
        dispatch("delete");
    }

    async function removeStaff() {
        if (staff == null) return;
        await staff.delete();
        dispatch("delete");
    }
</script>

<Item>
    <p class="grow">
        {invite?.member.name ?? staff?.member.name}
    </p>
    {#if invite}
        <Badge variant="outline" class="flex flex-row items-center gap-2">
            <Mail />
            Invite
        </Badge>
    {/if}
    <Badge variant="secondary">{staff?.role.name ?? invite?.role.name}</Badge>
    <div slot="dropdown">
        {#if invite}
            <DropdownItem on:click={() => cancelInvite()} destructive>
                <Trash2 />
                Cancel Invite
            </DropdownItem>
        {:else}
            <DropdownItem on:click={() => removeStaff()} destructive>
                <Trash2 />
                Remove Staff
            </DropdownItem>
        {/if}
    </div>
</Item>
