<script lang="ts">
    import Gradient from "$lib/components/sb/gradient.svelte";
    import "../app.css";
    import User from "$lib/sb/User";
    import { goto } from "$app/navigation";
    import { onMount, onDestroy } from "svelte";
    import { Loader2 } from "lucide-svelte";
    import Logo from "$lib/components/sb/logo.svelte";
    import { page } from "$app/stores";
    import Community from "$lib/sb/Community";
    import CommunityNav from "$lib/components/sb/nav/communityNav.svelte";
    import * as Avatar from "$lib/components/ui/avatar";
    import {
        PersonStanding,
        Sun,
        Moon,
        DoorOpen,
        Menu,
    } from "lucide-svelte/icons";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import Branding from "$lib/sb/branding/Branding";
    import Button from "$lib/components/ui/button/button.svelte";
    let loggedIn = false;
    let loading = true;

    let afterLogin: string | null = null;
    let community: Community | null = null;
    let communities: Community[] = [];
    let dark = false;
    let branding: Branding | null = null;

    function toggleDark(newDark: boolean) {
        if (newDark) {
            localStorage.setItem("dark", String(new Date().getTime()));
        } else {
            localStorage.removeItem("dark");
        }
        dark = newDark;
        const classList = document.getElementsByTagName("body")[0]!.classList;
        if (dark) {
            classList.add("dark");
        } else {
            classList.remove("dark");
        }
    }

    onMount(async () => {
        if (localStorage.getItem("dark")) {
            dark = true;
        }
        toggleDark(dark);

        User.onLogin = async () => {
            console.log("logged in");
            loggedIn = true;
            if (afterLogin && afterLogin != "/login") {
                goto(afterLogin);
            } else if ($page.url.pathname == "/login") {
                goto("/");
            }
            await Community.get();
        };
        User.onLogout = () => {
            console.log("logged out");
            loggedIn = false;
            afterLogin = $page.url.pathname;
            if (!afterLogin || afterLogin == "/login") {
                afterLogin = "/";
            }
            goto("/login");
            loading = false;
        };
        Branding.onBranding = (br) => {
            console.log("new branding", br);
            branding = br;
            if (branding && branding.primary) {
                document.documentElement.style.setProperty(
                    "--primary",
                    `${branding.primary.h} ${branding.primary.s}% 40%`,
                );
                document.documentElement.style.setProperty(
                    "--primary-dark",
                    `${branding.primary.h} ${branding.primary.s}% 50%`,
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
        Community.onSelected = async (
            selectedCommunity,
            existingCommunities,
        ) => {
            console.log("community selected");
            activeSidebar = false;
            Branding.clearCache();
            loading = false;
            community = selectedCommunity;
            communities = existingCommunities;
            if (!community) {
                goto("/onboarding");
                return;
            }
            Branding.get().then(() => {});
        };
        loading = true;
        const user = await User.get();
        if (user) {
            await Community.get();
        }
    });

    $: if ($page.url.pathname) {
        activeSidebar = false;
    }

    let activeSidebar = false;
</script>

<main>
    {#if loggedIn && $page.url.pathname != "/onboarding"}
        <div class="flex flex-row h-full absolute w-full">
            <div
                class:hidden={!activeSidebar}
                class="h-full w-3/4 md:w-full md:max-w-72 border-r fixed md:relative md:block z-50 bg-white dark:bg-black"
            >
                <div class="h-full w-full flex flex-col">
                    <CommunityNav {branding} {community} {communities} />
                    <div class="px-3 pt-2 pb-7 hidden md:block">
                        <Logo center />
                    </div>
                </div>
            </div>
            <button
                on:click={() => (activeSidebar = false)}
                class:hidden={!activeSidebar}
                class="md:hidden fixed w-full h-full bg-black z-40 backdrop-blur-sm bg-opacity-50"
            />
            <div class="grow h-screen overflow-y-scroll flex flex-col gap-5">
                <div class="border-b p-2 px-3 flex flex-row gap-5 items-center">
                    <Button
                        size="icon"
                        on:click={() => (activeSidebar = !activeSidebar)}
                        class="aspect-square rounded-full md:hidden block"
                        variant="ghost"
                    >
                        <Menu />
                    </Button>
                    <div class="md:hidden">
                        <Logo />
                    </div>
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger class="ml-auto">
                            <Avatar.Root>
                                <Avatar.Fallback>
                                    <PersonStanding />
                                </Avatar.Fallback>
                            </Avatar.Root>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                            <DropdownMenu.Group>
                                <DropdownMenu.Label
                                    >My Account</DropdownMenu.Label
                                >
                                <DropdownMenu.Separator />
                                <DropdownMenu.Item
                                    on:click={() => User.logout()}
                                >
                                    <DoorOpen />
                                    Log Out
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    on:click={() => toggleDark(!dark)}
                                >
                                    {#if dark}
                                        <Sun />
                                        Light Mode
                                    {:else}
                                        <Moon />
                                        Dark Mode
                                    {/if}
                                </DropdownMenu.Item>
                            </DropdownMenu.Group>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </div>
                <div class="w-full mx-auto max-w-screen-2xl pb-10">
                    <div class="grow p-5 flex flex-col gap-5">
                        {#key community}
                            <slot />
                        {/key}
                    </div>
                    <div class="w-1/5"></div>
                </div>
            </div>
        </div>
    {:else}
        <div>
            {#if !loading}
                <Gradient />
            {/if}
            <div
                class="w-full h-full absolute flex flex-col items-center justify-center px-5"
            >
                <div class="w-full max-w-md flex flex-col gap-5">
                    {#if !loading}
                        <slot />
                    {:else}
                        <Logo center big />
                        <Loader2 class="animate-spin mx-auto" />
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</main>
