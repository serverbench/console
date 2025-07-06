<script lang="ts">
    import { goto } from "$app/navigation";
    import Logo from "$lib/components/sb/logo.svelte";
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import List from "$lib/components/sb/section/list/list.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
    import Community from "$lib/sb/Community";
    import User from "$lib/sb/User";
    import { ArrowRight, HardDrive, Landmark, Link } from "lucide-svelte";
    import { onMount } from "svelte";
    let communities: Community[] = [];
    let loading = false;

    onMount(async () => {
        loading = true;
        communities = await Community.list();
        loading = false;
    });
</script>

<Logo center big />
<div class="flex flex-col gap-2">
    <p class="text-center">Your Communities</p>
    <List>
        {#each communities as community (community.id)}
            <Item
                href="#"
                on:click={() => {
                    community.select();
                    goto(`/community/members`);
                }}
            >
                <span>
                    {community.name}
                </span>
                <Button class="ml-auto" size="icon">
                    <ArrowRight />
                </Button>
            </Item>
        {/each}
        {#if loading}
            {#each Array(3) as _, i (i)}
                <Item>
                    <Skeleton class="w-full h-8" />
                </Item>
            {/each}
        {/if}
    </List>
    {#if !loading}
        <div class="text-center text-muted-foreground flex flex-col gap-2">
            <Button href="/onboarding">Create Community</Button>
        </div>
    {/if}
    <p class="text-center mt-6">Your Account</p>
    <List>
        <Item href="/me/referrals"
            >Manage Referrals

            <Button class="ml-auto" size="icon">
                <Link />
            </Button>
        </Item>
        <Item href="/me/wallet"
            >Manage Funds

            <Button class="ml-auto" size="icon">
                <Landmark />
            </Button>
        </Item>
        <Item href="/me/machines"
            >Manage Machines

            <Button class="ml-auto" size="icon">
                <HardDrive />
            </Button>
        </Item>
    </List>
</div>
