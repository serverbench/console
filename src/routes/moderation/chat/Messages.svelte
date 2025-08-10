<script lang="ts">
    import List from "$lib/components/sb/section/list/list.svelte";
    import Section from "$lib/components/sb/section/section.svelte";
    import ChatMessage from "$lib/sb/moderation/chat/ChatMessage";
    import ChatStream from "$lib/sb/moderation/chat/ChatStream";
    import { onDestroy, onMount } from "svelte";
    import { blur, scale } from "svelte/transition";
    import ChatMessageItem from "../../community/members/[id]/messages/ChatMessageItem.svelte";
    import type Instance from "$lib/sb/server/Instance";
    import Button from "$lib/components/ui/button/button.svelte";
    import CategoryToggle from "./CategoryToggle.svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import {
        ArrowRight,
        EllipsisVertical,
        Volume2,
        VolumeX,
        Wrench,
    } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import type Member from "$lib/sb/member/Member";
    import MemberDetails from "../../community/members/[id]/MemberDetails.svelte";
    import MemberMessages from "../../community/members/[id]/messages/MemberMessages.svelte";
    import { navigating } from "$app/state";

    let member: Member | null = null;

    const toxicityLevels = {
        low: 30,
        medium: 45,
        high: 60,
        "very high": 75,
        critical: 85,
    };
    let cs: ChatStream | null = null;
    onMount(async () => {
        cs = await new ChatStream(
            onConnected,
            onMessages,
            onInstances,
            onToxicity,
        ).stream();
        setTimeout(() => {
            loadSettings();
        }, 1);
    });

    onDestroy(() => {
        cs?.close();
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

    let sounds = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", null];
    let alertSound: string | null = "f";
    let newMessageSound: string | null = null;
    let enabledSounds = false;
    let toxicityLevel = Object.values(toxicityLevels)[1];
    let showToxicOnly = false;

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
        if (msg.toxicity.isToxic(false, toxicityLevel) && enabledSounds) {
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
        const savedToxicityLevel = localStorage.getItem("chat:toxicityLevel");
        if (savedToxicityLevel) {
            toxicityLevel = JSON.parse(savedToxicityLevel);
        }
        const savedShowToxicOnly = localStorage.getItem("chat:showToxicOnly");
        if (savedShowToxicOnly) {
            showToxicOnly = JSON.parse(savedShowToxicOnly);
        }
        if (savedTabView) {
            toast.success("Chat settings loaded from local storage");
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
        localStorage.setItem(
            "chat:toxicityLevel",
            JSON.stringify(toxicityLevel),
        );
        localStorage.setItem(
            "chat:showToxicOnly",
            JSON.stringify(showToxicOnly),
        );
        loaded = true;
        toast.info("Chat settings saved to local storage");
    }

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

<Dialog.Root open={member != null}>
    {#if member != null}
        <Dialog.Content class="sm:max-w-[700px]">
            <Dialog.Header>
                <Dialog.Title>{member.name}</Dialog.Title>
            </Dialog.Header>
            <div class="max-h-96 overflow-auto">
                <MemberMessages condensed {member} filters={{}} />
            </div>
            <Dialog.Footer>
                <Button href="/community/members/{member.id}">
                    See Full Profile <ArrowRight />
                </Button>
            </Dialog.Footer>
        </Dialog.Content>
    {/if}
</Dialog.Root>

<div class="flex flex-row gap-2 items-center">
    <CategoryToggle
        on:change={() => saveSettings()}
        bind:show={showDm}
        connected={connectedDm}
    >
        DMs
    </CategoryToggle>
    <CategoryToggle
        on:change={() => saveSettings()}
        bind:show={showPublic}
        connected={connectedAll}
    >
        Public
    </CategoryToggle>
    <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild let:builder>
            <Button builders={[builder]} variant="secondary">
                Display Settings
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
            <DropdownMenu.RadioGroup value={`${tabView}`}>
                {#each Array(5) as _, i}
                    <DropdownMenu.RadioItem
                        on:click={() => {
                            tabView = i + 1;
                            saveSettings();
                        }}
                        value={`${i + 1}`}
                    >
                        {i + 1}-Column View
                    </DropdownMenu.RadioItem>
                {/each}
            </DropdownMenu.RadioGroup>
            <DropdownMenu.Separator />
            <DropdownMenu.Label>Toxicity Flagging</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.RadioGroup value={`${toxicityLevel}`}>
                {#each Object.entries(toxicityLevels) as [name, level]}
                    <DropdownMenu.RadioItem
                        on:click={() => {
                            toxicityLevel = level;
                            saveSettings();
                        }}
                        value={`${level}`}
                    >
                        {name}
                    </DropdownMenu.RadioItem>
                {/each}
            </DropdownMenu.RadioGroup>
            <DropdownMenu.Separator />
            <DropdownMenu.Label>Toxicity Filtering</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.RadioGroup value={`${showToxicOnly}`}>
                <DropdownMenu.RadioItem
                    on:click={() => {
                        showToxicOnly = false;
                        saveSettings();
                    }}
                    value={`${false}`}
                >
                    Show All Messages
                </DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem
                    on:click={() => {
                        showToxicOnly = true;
                    }}
                    value={`${true}`}
                >
                    Show Only Toxic Messages
                </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
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
                <DropdownMenu.RadioGroup value={alertSound ?? ""}>
                    {#each sounds.filter((s) => s != null) as sound}
                        <DropdownMenu.RadioItem
                            value={sound ?? ""}
                            on:click={() => {
                                alertSound = sound;
                                play(true);
                                saveSettings();
                            }}
                        >
                            {sound ? sound : "None"}
                        </DropdownMenu.RadioItem>
                    {/each}
                </DropdownMenu.RadioGroup>
                <DropdownMenu.Separator />
                <DropdownMenu.Label>New Message</DropdownMenu.Label>
                <DropdownMenu.Separator />
                <DropdownMenu.RadioGroup value={newMessageSound ?? ""}>
                    {#each sounds as sound}
                        <DropdownMenu.RadioItem
                            value={sound ?? ""}
                            on:click={() => {
                                newMessageSound = sound;
                                play(false);
                                saveSettings();
                            }}
                        >
                            {sound ? sound : "None"}
                        </DropdownMenu.RadioItem>
                    {/each}
                </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    </div>
</div>

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
                        class:h-[800px]={tabView <= 1}
                        class:aspect-square={tabView > 1}
                    >
                        <List hideBorder hideTopBorder>
                            {#each messages as message (message.id)}
                                {#if tabView <= 1 || (tabView > 1 && message.session.instance.id == instance.id)}
                                    {#if !hiddenInstances.get(message.session.instance.id) && ((message.to && showDm) || (message.to == null && showPublic)) && (!showToxicOnly || message.toxicity.isToxic(false, toxicityLevel))}
                                        <ChatMessageItem
                                            on:click={() => {
                                                member = message.from;
                                            }}
                                            {toxicityLevel}
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
