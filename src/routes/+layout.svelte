<script lang="ts">
    import Gradient from "$lib/components/sb/gradient.svelte";
    import "../app.css";
    import User from "$lib/sb/User";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { Landmark, Link, Loader2, TestTubeDiagonal } from "lucide-svelte";
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
    import * as Card from "$lib/components/ui/card";
    import CommunityPicker from "$lib/components/sb/nav/CommunityPicker.svelte";
    import { blur, fade, fly, scale, slide } from "svelte/transition";
    import { dark } from "$lib";
    import MemberSearch from "$lib/components/sb/MemberSearch.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    let loggedIn = false;

    let afterLogin: string | null = null;
    let isTest = false;

    function toggleDark(newDark: boolean) {
        if (newDark) {
            localStorage.setItem("dark", String(new Date().getTime()));
        } else {
            localStorage.removeItem("dark");
        }
        dark.set(newDark);
        const classList = document.getElementsByTagName("body")[0]!.classList;
        if ($dark) {
            classList.add("dark");
        } else {
            classList.remove("dark");
        }
    }

    onMount(async () => {
        if (localStorage.getItem("dark")) {
            dark.set(true);
        }
        toggleDark($dark);

        User.onLogin = async () => {
            console.log("logged in");
            loggedIn = true;
            if (afterLogin != null && afterLogin != "/login") {
                goto(afterLogin);
            } else if ($page.url.pathname == "/login") {
                goto("/pick");
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

        const user = await User.get();
        if (user?.isTest()) {
            isTest = true;
        }
    });

    $: if ($page.url.pathname) {
        activeSidebar = false;
    }

    let activeSidebar = false;
    let community: Community | null = null;

    $: mainContent = !["/onboarding", "/login", "/pick"].includes(
        $page.url.pathname,
    );
    $: userContent = $page.url.pathname.startsWith("/me");
</script>

<Toaster />

{#if mainContent}
    <div
        class="fixed h-screen w-full top-0"
        class:z-20={!activeSidebar}
        class:z-50={activeSidebar}
    >
        <div class="flex flex-row h-full absolute inset-0 lg:p-3 gap-5">
            <!-- Sidebar -->
            <div
                class="h-full w-3/5 lg:w-full lg:max-w-72 absolute lg:relative lg:block z-50 transition-transform"
                class:translate-x-0={activeSidebar}
                class:-translate-x-full={!activeSidebar}
                class:lg:translate-x-0={true}
            >
                <Card.Root
                    class="h-full w-full overflow-hidden rounded-l-none md:rounded-l-lg"
                >
                    <div class="h-full w-full flex flex-col">
                        {#if userContent}
                            <UserNav />
                        {:else}
                            <CommunityNav />
                        {/if}
                        {#if isTest}
                            <div
                                transition:fade
                                class="bg-orange-500 text-center text-orange-50 bg-opacity-10 border-t-2 border-orange-500 group h-10 flex flex-col items-center justify-center overflow-hidden"
                            >
                                <TestTubeDiagonal
                                    class="mx-auto group-hover:hidden"
                                />
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                <!-- svelte-ignore a11y-missing-attribute -->
                                <a
                                    on:click={() =>
                                        (window.location.href =
                                            window.location.href + "?prod")}
                                    class="hidden group-hover:block"
                                >
                                    switch to prod
                                </a>
                            </div>
                        {/if}
                    </div>
                </Card.Root>
            </div>

            <!-- Overlay -->
            <button
                on:click={() => (activeSidebar = false)}
                class:hidden={!activeSidebar}
                class="md:hidden absolute inset-0 bg-black z-30 backdrop-blur-sm bg-opacity-50"
            />
        </div>
    </div>
{/if}

<!-- Top bar -->
{#if !activeSidebar}
    <div
        transition:fade={{ duration: 200 }}
        class:hidden={!mainContent}
        class:z-30={!activeSidebar}
        class="flex flex-row gap-5 lg:py-3 lg:px-4 p-2 fixed w-full top-0"
    >
        <div class="w-3/4 md:w-full md:max-w-72 lg:block hidden"></div>
        <div
            class="w-full z-50 top-0 left-0 right-0 lg:relative lg:top-auto lg:left-auto lg:right-auto"
        >
            <Card.Root
                class="p-2 px-3 flex flex-row gap-5 items-center backdrop-blur-xl bg-white dark:bg-black bg-opacity-50 dark:bg-opacity-50 rounded-full"
            >
                <Button
                    size="icon"
                    on:click={() => (activeSidebar = !activeSidebar)}
                    class="aspect-square rounded-full lg:hidden block"
                    variant="ghost"
                >
                    <Menu />
                </Button>
                {#if !userContent}
                    <div class="mr-auto">
                        <CommunityPicker bind:community />
                    </div>
                    <MemberSearch />
                {/if}
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        <Avatar.Root>
                            <Avatar.Fallback>
                                <PersonStanding />
                            </Avatar.Fallback>
                        </Avatar.Root>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                        <DropdownMenu.Group>
                            <DropdownMenu.Label>My Account</DropdownMenu.Label>
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
                                on:click={() => toggleDark(!$dark)}
                            >
                                {#if $dark}
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
            </Card.Root>
        </div>
    </div>
{/if}

<!-- Main content -->
<main class="relative flex flex-row gap-5 min-h-screen lg:py-3 lg:px-4 p-2">
    {#if mainContent}
        <div class="min-w-72 lg:block hidden"></div>
        <div
            class="grow flex flex-col gap-5 mt-16 pt-2 z-20 px-1 overflow-x-hidden"
        >
            {#key community?.id}
                {#if $page.url.pathname.startsWith("/me")}
                    <slot />
                {:else if community}
                    <slot />
                {:else}
                    <Skeleton />
                {/if}
            {/key}
        </div>
    {:else}
        <div class="h-full">
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
