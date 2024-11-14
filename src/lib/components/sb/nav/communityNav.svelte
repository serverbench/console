<script lang="ts">
    import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Avatar from "$lib/components/ui/avatar";
    import {
        UsersRound,
        Check,
        Loader2,
        Castle,
        ChevronsUpDown,
        Plus,
        Megaphone,
        Server,
        Gavel,
        Landmark
    } from "lucide-svelte/icons";
    import NavSection from "$lib/components/sb/nav/navSection.svelte";
    import NavLink from "$lib/components/sb/nav/navLink.svelte";
    import type Community from "$lib/sb/Community";
    import type Branding from "$lib/sb/branding/Branding";

    export let community: Community | null,
        communities: Community[],
        branding: Branding | null;
</script>

<div class="p-3 pb-0">
    <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild let:builder>
            <Button
                class="rounded-full w-full group"
                builders={[builder]}
                variant="ghost"
            >
                {#if community}
                    {#if branding?.iso}
                        <Avatar.Root class="rounded-none w-4 h-4">
                            <Avatar.Image
                                src={branding.iso}
                                alt={community.name}
                            />
                            <Avatar.Fallback
                                >{community.name[0]?.toUpperCase() ??
                                    "?"}</Avatar.Fallback
                            >
                        </Avatar.Root>
                    {:else}
                        <Castle />
                    {/if}
                    {community?.name}
                    <ChevronsUpDown
                        class="opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                    />
                {:else}
                    <Loader2
                        class="animate-spin opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                {/if}
            </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="w-56">
            <DropdownMenu.Label>Communities</DropdownMenu.Label>
            <DropdownMenu.Separator />
            {#each communities as c}
                <DropdownMenu.Item
                    class="flex flex-row gap-2 items-center"
                    on:click={() => c.select()}
                >
                    <span>{c.name}</span>
                    {#if c.id == community?.id}
                        <Check />
                    {/if}
                </DropdownMenu.Item>
            {/each}
            <DropdownMenu.Separator />
            <DropdownMenu.Item
                href="/onboarding"
                class="flex flex-row gap-2 items-center"
            >
                <Plus />
                Join or Create
            </DropdownMenu.Item>
        </DropdownMenu.Content>
    </DropdownMenu.Root>
</div>
<ScrollArea class="grow p-6">
    <div class="flex flex-col gap-5">
        <NavSection icon={UsersRound} name="community">
            <NavLink href="/community/members">
                Members
            </NavLink>
            <NavLink href="/community/demographics">
                Demographics
            </NavLink>
            <NavLink href="/community/playtime">
                Playtime
            </NavLink>
            <NavLink href="/community/image">
                Image
            </NavLink>
        </NavSection>
        <NavSection icon={Megaphone} name="marketing">
            <NavLink href="/marketing/listings">
                Listings
            </NavLink>
            <NavLink href="/marketing/creators">
                Creators
            </NavLink>
            <NavLink href="/marketing/media">
                Media
            </NavLink>
        </NavSection>
        <NavSection icon={Server} name="servers">
            <NavLink href="/servers/manage">
                List
            </NavLink>
            <NavLink href="/servers/incidents">
                Incidents
            </NavLink>
        </NavSection>
        <NavSection icon={Gavel} name="moderation">
            <NavLink href="/moderation/staff">
                Staff
            </NavLink>
            <NavLink href="/moderation/chat">
                Chat
            </NavLink>
            <NavLink href="/moderation/reports">
                Reports
            </NavLink>
            <NavLink href="/moderation/punishments">
                Punishments
            </NavLink>
            <NavLink href="/moderation/appeals">
                Appeals
            </NavLink>
        </NavSection>
        <NavSection icon={Landmark} name="payments">
            <NavLink href="/payments/products">
                Products
            </NavLink>
            <NavLink href="/payments/gateways">
                Gateways
            </NavLink>
            <NavLink href="/payments/currencies">
                Currencies
            </NavLink>
            <NavLink href="/payments/transactions">
                Transactions
            </NavLink>
            <NavLink href="/payments/subscriptions">
                Subscriptions
            </NavLink>
            <NavLink href="/payments/sales">
                Sales
            </NavLink>
            <NavLink href="/payments/coupons">
                Coupons
            </NavLink>
        </NavSection>
    </div>
</ScrollArea>
