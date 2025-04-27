<script lang="ts">
    import Gradient from "$lib/components/sb/gradient.svelte";
    import "../app.css";
    import User from "$lib/sb/User";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { Landmark, Link, Loader2 } from "lucide-svelte";
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
    import Button from "$lib/components/ui/button/button.svelte";
    import UserNav from "$lib/components/sb/nav/userNav.svelte";
    import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
    import { Toaster } from "$lib/components/ui/sonner";
    let loggedIn = false;

    let afterLogin: string | null = null;
    let dark = false;

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
            if (afterLogin != null && afterLogin != "/login") {
                goto(afterLogin);
            } else if ($page.url.pathname == "/login") {
                goto("/me");
            }
            await Community.get();
        };
        User.onLogout = () => {
            console.log("logged out");
            loggedIn = false;
            afterLogin = $page.url.href;
            if (!afterLogin || afterLogin == "/login") {
                afterLogin = "/";
            }
            goto("/login");
        };

        await User.get();
    });

    $: if ($page.url.pathname) {
        activeSidebar = false;
    }

    let activeSidebar = false;
    let community: Community | null = null;
</script>

<Toaster />

<main>
    {#if !["/onboarding", "/login"].includes($page.url.pathname)}
        <div class="flex flex-row h-full absolute w-full">
            <div
                class:hidden={!activeSidebar}
                class="h-full w-3/4 md:w-full md:max-w-72 border-r fixed md:relative md:block z-50 bg-white dark:bg-black"
            >
                <div class="h-full w-full flex flex-col">
                    {#if $page.url.pathname.startsWith("/me")}
                        <UserNav />
                    {:else}
                        <CommunityNav bind:community />
                    {/if}
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
                                <DropdownMenu.Item href="/me/referrals">
                                    <Link />
                                    Referrals
                                </DropdownMenu.Item>
                                <DropdownMenu.Item href="/me/wallet">
                                    <Landmark />
                                    Wallet
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator />
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
                                <DropdownMenu.Separator />
                                <DropdownMenu.Item
                                    class="destructive"
                                    on:click={() => User.logout()}
                                >
                                    <DoorOpen />
                                    Log Out
                                </DropdownMenu.Item>
                            </DropdownMenu.Group>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </div>
                <div class="w-full mx-auto max-w-screen-2xl pb-10">
                    <div class="grow p-5 flex flex-col gap-5">
                        {#key community}
                            {#if $page.url.pathname.startsWith("/me")}
                                <slot />
                            {:else if community}
                                <slot />
                            {:else}
                                <Skeleton />
                            {/if}
                        {/key}
                    </div>
                    <div class="w-1/5"></div>
                </div>
            </div>
        </div>
    {:else}
        <div>
            <Gradient />
            <div
                class="w-full h-full absolute flex flex-col items-center justify-center px-5"
            >
                <div class="w-full max-w-md flex flex-col gap-5">
                    <slot />
                </div>
            </div>
        </div>
    {/if}
</main>
