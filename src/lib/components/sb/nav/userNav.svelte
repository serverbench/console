<script lang="ts">
    import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
    import { Landmark, Link, Server } from "lucide-svelte/icons";
    import NavSection from "$lib/components/sb/nav/navSection.svelte";
    import NavLink from "$lib/components/sb/nav/navLink.svelte";
    import Logo from "../logo.svelte";
</script>

<ScrollArea class="grow ">
    <div class="absolute top-0 py-5 w-full pointer-events-none z-50">
        <Logo center />
    </div>
    <div class="absolute top-0 w-full pointer-events-none">
        <div
            class="backdrop-blur-xl w-full py-12 mask-gradient-top transition-all duration-1000 ease-in-out"
        ></div>
    </div>
    <div class="absolute bottom-0 w-full pointer-events-none">
        <div
            class="backdrop-blur-xl w-full py-8 mask-gradient-bottom transition-all duration-1000 ease-in-out"
        ></div>
    </div>
    <div class="flex flex-col gap-5 px-6 pt-14 pb-6">
        <NavSection icon={Landmark} name="balance">
            <NavLink href="/me/wallet">Wallet</NavLink>
        </NavSection>
        <NavSection icon={Link} name="communities">
            <NavLink href="/me/referrals">Referrals</NavLink>
        </NavSection>
        <NavSection icon={Server} name="machines">
            <NavLink href="/me/machines">Machines</NavLink>
        </NavSection>
    </div>
</ScrollArea>
