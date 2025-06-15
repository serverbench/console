<script lang="ts">
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Avatar from "$lib/components/ui/avatar";
    import Community from "$lib/sb/Community";
    import Branding from "$lib/sb/branding/Branding";
    import User from "$lib/sb/User";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { Castle, Check, ChevronsUpDown, Loader2, Plus } from "lucide-svelte";

    export let community: Community | null;

    let communities: Community[],
        branding: Branding | null;

    onMount(async () => {
        Community.onSelected = async (
            selectedCommunity,
            existingCommunities,
        ) => {
            console.log("community selected", {
                selectedCommunity,
                existingCommunities,
            });
            Branding.clearCache();
            community = selectedCommunity;
            communities = existingCommunities;
            if (!community) {
                if (communities.length <= 0) {
                    goto("/onboarding");
                } else {
                    communities[0].select();
                }
            } else {
                Branding.get().then(() => {});
            }
        };
        const user = await User.get();
        if (user) {
            await Community.get();
        }

        Branding.onBranding = (br) => {
            console.log("new branding", br);
            branding = br;
            if (branding && branding.primary) {
                document.documentElement.style.setProperty(
                    "--primary",
                    `${branding.primary.h} ${branding.primary.s}% 15%`,
                );
                document.documentElement.style.setProperty(
                    "--primary-dark",
                    `${branding.primary.h} ${branding.primary.s}% 90%`,
                );
            } else {
                document.documentElement.style.setProperty(
                    "--primary",
                    "var(--primary-fallback)",
                );
                document.documentElement.style.setProperty(
                    "--primary-dark",
                    "var(--primary-dark-fallback)",
                );
            }
        };
    });
</script>

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
                        <Avatar.Image src={branding.iso} alt={community.name} />
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
