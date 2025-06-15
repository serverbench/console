<script lang="ts">
    import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
    import {
        UsersRound,
        Megaphone,
        Server,
        Gavel,
        Landmark,
    } from "lucide-svelte/icons";
    import NavSection from "$lib/components/sb/nav/navSection.svelte";
    import NavLink from "$lib/components/sb/nav/navLink.svelte";
    import Logo from "../logo.svelte";
</script>

<ScrollArea class="grow relative">
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
    <div class="mt-14 border mx-5 mb-4 rounded-full"></div>
    <div class="flex flex-col gap-5 px-6 pb-14">
        <NavSection icon={UsersRound} name="community">
            <NavLink href="/community/members">Members</NavLink>
            <NavLink href="/community/briefings">Briefings</NavLink>
            <NavLink href="/community/branding">Branding</NavLink>
        </NavSection>
        <NavSection icon={Megaphone} name="marketing">
            <NavLink href="/marketing/listings">Listings</NavLink>
            <NavLink href="/marketing/referrals">Referrals</NavLink>
        </NavSection>
        <NavSection icon={Server} name="servers">
            <NavLink href="/servers/manage">List</NavLink>
            <NavLink href="/servers/incidents">Incidents</NavLink>
        </NavSection>
        <NavSection icon={Gavel} name="moderation">
            <NavLink href="/moderation/staff">Staff</NavLink>
            <NavLink href="/moderation/chat">Chat</NavLink>
            <NavLink href="/moderation/reports">Reports</NavLink>
            <NavLink href="/moderation/punishments">Punishments</NavLink>
            <NavLink href="/moderation/appeals">Appeals</NavLink>
        </NavSection>
        <NavSection icon={Landmark} name="payments">
            <NavLink href="/payments/products">Products</NavLink>
            <NavLink href="/payments/currencies">Currencies</NavLink>
            <NavLink href="/payments/transactions">Transactions</NavLink>
            <NavLink href="/payments/subscriptions">Subscriptions</NavLink>
            <NavLink href="/payments/sales">Sales</NavLink>
            <NavLink href="/payments/coupons">Coupons</NavLink>
        </NavSection>
    </div>
</ScrollArea>
