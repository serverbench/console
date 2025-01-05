<script lang="ts">
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import Section from "$lib/components/sb/section/section.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import type Member from "$lib/sb/member/Member";
    import type ReferralCode from "$lib/sb/referral/ReferralCode";
    import type ReferralProgram from "$lib/sb/referral/ReferralProgram";
    import { onMount } from "svelte";

    export let referralCode: ReferralCode | null = null;
    export let referralProgram: ReferralProgram | null = null;

    let loading = false;
    let members: Member[] = [];
    let page = 0;
    let finish = false;

    onMount(async () => {
        await loadMembers();
    });

    async function loadMembers() {
        if (loading) return;
        loading = true;
        const provider = referralCode ?? referralProgram;
        if (provider == null)
            throw new Error("No referral code or program provided");
        const loadedMembers = await provider.getJoiningMembers(page);
        console.log(loadedMembers);
        finish = loadedMembers.length < 20;
        members = [...members, ...loadedMembers];
        page++;
        loading = false;
    }
</script>

<Section
    used={members.length}
    emptySubtitle={false}
    {loading}
    list
    name="Referred Members"
>
    {#each members as member}
        <Item>
            <div class="grow">
                {member.name}
            </div>
            {#if (referralCode && member.firstConnection?.referral?.id == referralCode.id) || (referralProgram && member.firstConnection?.referral?.program.id == referralProgram.id)}
                <Badge>New Member</Badge>
            {:else}
                <Badge variant="outline">Existing Member</Badge>
            {/if}
        </Item>
    {/each}
    {#if !finish}
        <Item>
            <Button
                class="w-full"
                on:click={() => loadMembers()}
                disabled={loading}>Load More</Button
            >
        </Item>
    {/if}
</Section>
