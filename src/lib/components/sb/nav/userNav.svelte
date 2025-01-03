<script lang="ts">
    import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
    import { Landmark, Link } from "lucide-svelte/icons";
    import NavSection from "$lib/components/sb/nav/navSection.svelte";
    import NavLink from "$lib/components/sb/nav/navLink.svelte";
</script>

<ScrollArea class="grow p-6">
    <div class="flex flex-col gap-5">
        <NavSection icon={Landmark} name="community">
            <NavLink href="/me/wallet">Wallet</NavLink>
        </NavSection>
        <NavSection icon={Link} name="community">
            <NavLink href="/me/referrals">Referrals</NavLink>
        </NavSection>
    </div>
</ScrollArea>
