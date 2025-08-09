<script lang="ts">
    import List from "$lib/components/sb/section/list/list.svelte";
    import Section from "$lib/components/sb/section/section.svelte";
    import ChatMessage from "$lib/sb/moderation/chat/ChatMessage";
    import ChatStream from "$lib/sb/moderation/chat/ChatStream";
    import { onMount } from "svelte";
    import { blur, scale } from "svelte/transition";
    import ChatMessageItem from "../../community/members/[id]/messages/ChatMessageItem.svelte";
    import type Instance from "$lib/sb/server/Instance";
    import Button from "$lib/components/ui/button/button.svelte";
    import CategoryToggle from "./CategoryToggle.svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import {
        Check,
        EllipsisVertical,
        Pause,
        Speaker,
        Volume,
        Volume2,
        VolumeX,
        Wrench,
    } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import type Toxicity from "$lib/sb/moderation/chat/Toxicity";

    onMount(async () => {
        await new ChatStream(
            onConnected,
            onMessages,
            onInstances,
            onToxicity,
        ).stream();
        setTimeout(() => {
            loadSettings();
        }, 1);
    });

    let tabView = 4;
    let hiddenInstances: Map<string, boolean> = new Map();

    let instances: Instance[] = [];
    let connectedDm: boolean | null = null;
    let connectedAll: boolean | null = null;
    let messages: ChatMessage[] = [];
    let loaded = false;
    let showPublic = true;
    let showDm = true;

    let sounds = ["a", "b", "c", "d", "e", "f", null];
    let alertSound: string | null = "f";
    let newMessageSound: string | null = null;
    let enabledSounds = false;

    function onConnected(dm: boolean | null, all: boolean | null) {
        connectedDm = dm;
        connectedAll = all;
    }

    function onMessages(newMessages: ChatMessage[], toxicity: boolean) {
        messages = newMessages;
        if (enabledSounds && !toxicity) {
            play(false);
        }
    }

    function onInstances(newInstances: Instance[]) {
        instances = newInstances;
        for (const instance of instances) {
            if (!hiddenInstances.has(instance.id)) {
                hiddenInstances.set(instance.id, false);
            }
        }
    }

    function onToxicity(msg: ChatMessage) {
        if (msg.toxicity.isToxic() && enabledSounds) {
            play(true);
        }
    }

    function loadSettings() {
        const savedTabView = localStorage.getItem("chat:tabView");
        if (savedTabView) {
            tabView = JSON.parse(savedTabView);
        }
        const savedHiddenInstances = localStorage.getItem(
            "chat:hiddenInstances",
        );
        if (savedHiddenInstances) {
            hiddenInstances = new Map(JSON.parse(savedHiddenInstances));
        }
        const savedShowPublic = localStorage.getItem("chat:showPublic");
        if (savedShowPublic) {
            showPublic = JSON.parse(savedShowPublic);
        }
        const savedShowDm = localStorage.getItem("chat:showDm");
        if (savedShowDm) {
            showDm = JSON.parse(savedShowDm);
        }
        if (savedHiddenInstances || savedTabView) {
            toast.info("Chat settings loaded from local storage");
        }
        const savedAlertSound = localStorage.getItem("chat:alertSound");
        if (savedAlertSound) {
            alertSound = JSON.parse(savedAlertSound);
        }
        const savedNewMessageSound = localStorage.getItem(
            "chat:newMessageSound",
        );
        if (savedNewMessageSound) {
            newMessageSound = JSON.parse(savedNewMessageSound);
        }
        loaded = true;
    }

    function saveSettings() {
        if (!loaded) return;
        localStorage.setItem("chat:tabView", JSON.stringify(tabView));
        localStorage.setItem(
            "chat:hiddenInstances",
            JSON.stringify(Array.from(hiddenInstances.entries())),
        );
        localStorage.setItem("chat:showPublic", JSON.stringify(showPublic));
        localStorage.setItem("chat:showDm", JSON.stringify(showDm));
        localStorage.setItem("chat:alertSound", JSON.stringify(alertSound));
        localStorage.setItem(
            "chat:newMessageSound",
            JSON.stringify(newMessageSound),
        );
        toast.info("Chat settings saved to local storage");
    }

    $: showDm, showPublic, newMessageSound, alertSound, saveSettings();

    function play(alert = true) {
        let url: string | null = null;
        if (alert && alertSound) {
            url = `https://cdn.serverbench.io/${alertSound}.mp3`;
        } else if (newMessageSound) {
            url = `https://cdn.serverbench.io/${newMessageSound}.mp3`;
        }
        if (url) {
            const audio = new Audio(url);
            audio.play();
        }
    }
</script>

<div
    class:grid={tabView > 1}
    class:lg:grid-cols-2={tabView == 2}
    class:lg:grid-cols-3={tabView == 3}
    class:lg:grid-cols-4={tabView == 4}
    class:lg:grid-cols-5={tabView == 5}
    class="grid-cols-1 gap-4"
>
    {#each tabView > 1 ? instances : [{ id: null, server: { slug: "" }, name: null }] as instance (instance.id)}
        {#if tabView <= 1 || (tabView > 1 && !hiddenInstances.get(instance.id ?? ""))}
            <div transition:blur>
                <Section
                    name={tabView > 1
                        ? `${instance.server.slug}-${instance.name ?? "main"}`
                        : "Chat Messages"}
                    small
                >
                    <div
                        class="overflow-auto"
                        class:h-[600px]={tabView <= 1}
                        class:aspect-square={tabView > 1}
                    >
                        <List hideBorder hideTopBorder>
                            {#each messages as message (message.id)}
                                {#if tabView <= 1 || (tabView > 1 && message.session.instance.id == instance.id)}
                                    {#if !hiddenInstances.get(message.session.instance.id) && ((message.to && showDm) || (message.to == null && showPublic))}
                                        <ChatMessageItem
                                            condensed={tabView > 1}
                                            entireHighlight
                                            showFrom
                                            {message}
                                        />
                                    {/if}
                                {/if}
                            {/each}
                        </List>
                    </div>
                </Section>
            </div>
        {/if}
    {/each}
</div>
<div class="flex flex-row gap-2 items-center justify-center">
    <CategoryToggle bind:show={showDm} connected={connectedDm}>
        DMs
    </CategoryToggle>
    <CategoryToggle bind:show={showPublic} connected={connectedAll}>
        Public
    </CategoryToggle>
    <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild let:builder>
            <Button builders={[builder]} variant="secondary">
                Settings
                <Wrench />
            </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="w-56">
            <DropdownMenu.Label>Instances</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Group>
                {#each instances as instance (instance.id)}
                    <DropdownMenu.CheckboxItem
                        on:click={() => {
                            hiddenInstances.set(
                                instance.id,
                                !hiddenInstances.get(instance.id),
                            );
                            hiddenInstances = hiddenInstances;
                            saveSettings();
                        }}
                        checked={!hiddenInstances.get(instance.id)}
                    >
                        {instance.server.slug}-{instance.name ?? "main"}
                    </DropdownMenu.CheckboxItem>
                {/each}
            </DropdownMenu.Group>
            <DropdownMenu.Separator />
            <DropdownMenu.Label>Display</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Group>
                {#each Array(5) as _, i}
                    <DropdownMenu.CheckboxItem
                        on:click={() => {
                            tabView = i + 1;
                            saveSettings();
                        }}
                        checked={tabView == i + 1}
                    >
                        {i + 1}-Column View
                    </DropdownMenu.CheckboxItem>
                {/each}
            </DropdownMenu.Group>
        </DropdownMenu.Content>
    </DropdownMenu.Root>
    <div class="flex flex-row items-center">
        <Button
            class="rounded-r-none"
            on:click={() => {
                if (!enabledSounds) {
                    play();
                }
                enabledSounds = !enabledSounds;
            }}
            variant="secondary"
        >
            {#if !enabledSounds}
                Enable Notification Sounds
                <Volume2 />
            {:else}
                Disable Notification Sounds
                <VolumeX />
            {/if}
        </Button>
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild let:builder>
                <Button
                    disabled={!enabledSounds}
                    size="icon"
                    class="rounded-l-none"
                    builders={[builder]}
                    variant="outline"
                >
                    <EllipsisVertical />
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content class="w-56">
                <DropdownMenu.Label>Alert Sound</DropdownMenu.Label>
                <DropdownMenu.Separator />
                <DropdownMenu.Group>
                    {#each sounds.filter((s) => s != null) as sound}
                        <DropdownMenu.CheckboxItem
                            on:click={() => {
                                alertSound = sound;
                                play(true);
                            }}
                            checked={alertSound == sound}
                        >
                            {sound ? sound : "None"}
                        </DropdownMenu.CheckboxItem>
                    {/each}
                </DropdownMenu.Group>
                <DropdownMenu.Separator />
                <DropdownMenu.Label>New Message</DropdownMenu.Label>
                <DropdownMenu.Separator />
                <DropdownMenu.Group>
                    {#each sounds as sound}
                        <DropdownMenu.CheckboxItem
                            on:click={() => {
                                newMessageSound = sound;
                                play(false);
                            }}
                            checked={newMessageSound == sound}
                        >
                            {sound ? sound : "None"}
                        </DropdownMenu.CheckboxItem>
                    {/each}
                </DropdownMenu.Group>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    </div>
</div>
