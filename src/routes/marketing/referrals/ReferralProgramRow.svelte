<script lang="ts">
    import DropdownItem from "$lib/components/sb/section/list/DropdownItem.svelte";
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import type ReferralProgram from "$lib/sb/referral/ReferralProgram";
    import { CircleUser, Link, Trash2 } from "lucide-svelte";

    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import ReferredList from "../../me/referrals/ReferredList.svelte";

    export let program: ReferralProgram, list: ReferralProgram[];

    let loading = false;

    let checkingMembers = false;
</script>

<Dialog.Root bind:open={checkingMembers}>
    <Dialog.Content>
        <ReferredList referralProgram={program} />
    </Dialog.Content>
</Dialog.Root>

<Item {loading}>
    <Badge>
        {program.cut}%
    </Badge>
    <div class="w-full">
        {program.id}
    </div>
    <div slot="dropdown" class="flex flex-col gap-1">
        <DropdownItem
            destructive
            on:click={async () => {
                loading = true;
                try {
                    await program.delete();
                    list = list.filter((p) => p.id !== program.id);
                } catch (error) {}
                loading = false;
            }}
        >
            <Trash2 />
            Delete
        </DropdownItem>
        <DropdownItem on:click={() => (checkingMembers = true)}>
            <CircleUser />
            Joining Members
        </DropdownItem>
        <DropdownItem
            on:click={() =>
                alert(
                    `https://console.beta.serverbench.io/me/referrals?join&community=${program.community.id}&program=${program.id}`,
                )}
        >
            <Link />
            Invite Users
        </DropdownItem>
    </div>
</Item>
