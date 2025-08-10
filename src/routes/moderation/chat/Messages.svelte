<script lang="ts">
    import List from "$lib/components/sb/section/list/list.svelte";
    import Section from "$lib/components/sb/section/section.svelte";
    import ChatMessage from "$lib/sb/moderation/chat/ChatMessage";
    import ChatStream from "$lib/sb/moderation/chat/ChatStream";
    import { onDestroy, onMount } from "svelte";
    import { blur, fade, scale } from "svelte/transition";
    import ChatMessageItem from "../../community/members/[id]/messages/ChatMessageItem.svelte";
    import type Instance from "$lib/sb/server/Instance";
    import Button from "$lib/components/ui/button/button.svelte";
    import CategoryToggle from "./CategoryToggle.svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import {
        ArrowRight,
        EllipsisVertical,
        Loader2,
        Volume2,
        VolumeX,
        Wrench,
    } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import type Member from "$lib/sb/member/Member";
    import MemberMessages from "../../community/members/[id]/messages/MemberMessages.svelte";
    import { Progress } from "$lib/components/ui/progress";
    import NumberFlow from "@number-flow/svelte";
    import { Motion } from "svelte-motion";

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
            onHistoric,
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

    // Use Set for faster lookups
    let hiddenInstancesSet = new Set<string>();
    let transitioning: number | null = null;

    let instances: Instance[] = [];
    let connectedDm: boolean | null = null;
    let connectedAll: boolean | null = null;
    let messages: ChatMessage[] = [];
    let loaded = false;
    let showPublic = true;
    let showDm = true;
    let left: number | null = null;
    let oldGoal: number | null = null;

    let sounds = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", null];
    let alertSound: string | null = "f";
    let newMessageSound: string | null = null;
    let enabledSounds = false;
    let toxicityLevel = Object.values(toxicityLevels)[1];
    let showToxicOnly = false;

    // Cached filtered messages for each instance
    let filteredMessagesCache = new Map<string | null, ChatMessage[]>();
    let lastFilterParams = "";

    // Pre-compute filter parameters hash to detect changes
    $: filterHash = `${tabView}-${showDm}-${showPublic}-${showToxicOnly}-${toxicityLevel}-${Array.from(hiddenInstancesSet).sort().join(",")}`;

    // Only recalculate filtered messages when filter parameters or messages change
    $: if (filterHash !== lastFilterParams || messages.length > 0) {
        lastFilterParams = filterHash;
        updateFilteredMessages();
    }

    // Sync hiddenInstances Map with Set for faster lookups
    $: {
        hiddenInstancesSet.clear();
        for (const [id, hidden] of hiddenInstances.entries()) {
            if (hidden) {
                hiddenInstancesSet.add(id);
            }
        }
    }

    function updateFilteredMessages() {
        const messagesToProcess = messages.slice(0, 500);
        filteredMessagesCache.clear();

        if (tabView <= 1) {
            // Single view - filter all messages
            filteredMessagesCache.set(
                null,
                messagesToProcess.filter((item) =>
                    shouldShowOptimized(null, item),
                ),
            );
        } else {
            // Multi-column view - filter by instance
            const instanceGroups = new Map<string, ChatMessage[]>();

            // Group messages by instance first
            for (const message of messagesToProcess) {
                const instanceId = message.session.instance.id;
                if (!instanceGroups.has(instanceId)) {
                    instanceGroups.set(instanceId, []);
                }
                instanceGroups.get(instanceId)!.push(message);
            }

            // Filter each group
            for (const [
                instanceId,
                instanceMessages,
            ] of instanceGroups.entries()) {
                if (!hiddenInstancesSet.has(instanceId)) {
                    filteredMessagesCache.set(
                        instanceId,
                        instanceMessages.filter((item) =>
                            shouldShowOptimized(instanceId, item),
                        ),
                    );
                }
            }
        }
        filteredMessagesCache = filteredMessagesCache;
    }

    // Optimized filter function with early returns and minimal property access
    function shouldShowOptimized(
        instanceId: string | null,
        message: ChatMessage,
    ): boolean {
        // Cache message properties
        const msgInstanceId = message.session.instance.id;
        const hasRecipient = message.to !== null;

        // Early return for hidden instances (fastest check)
        if (hiddenInstancesSet.has(msgInstanceId)) return false;

        // Early return for tab view filtering
        if (tabView > 1 && msgInstanceId !== instanceId) return false;

        // Early return for DM/Public filtering
        if (hasRecipient && !showDm) return false;
        if (!hasRecipient && !showPublic) return false;

        // Toxicity check last (most expensive)
        if (showToxicOnly && !message.toxicity.isToxic(false, toxicityLevel))
            return false;

        return true;
    }

    // Keep original function for compatibility if needed elsewhere
    function shouldShow(instance: string | null, message: ChatMessage) {
        return shouldShowOptimized(instance, message);
    }

    function onConnected(dm: boolean | null, all: boolean | null) {
        connectedDm = dm;
        connectedAll = all;
    }

    // Debounce message updates to reduce render frequency
    let messageUpdatePending = false;
    function onMessages(
        newMessages: ChatMessage[],
        toxicity: boolean,
        historical: boolean,
    ) {
        if (!messageUpdatePending) {
            messageUpdatePending = true;
            requestAnimationFrame(() => {
                messages = newMessages;
                messageUpdatePending = false;
            });
        } else {
            // If update is pending, just store the latest messages
            messages = newMessages;
        }

        if (enabledSounds && !toxicity && !historical) {
            play(false);
        }
    }

    function onHistoric(newLeft: number, og: number) {
        left = newLeft;
        oldGoal = og;
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

    function saveSettings(cb: () => void) {
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
        const now = Date.now();
        transitioning = Date.now();
        setTimeout(() => {
            if (transitioning === now) {
                cb();
                transitioning = null;
            }
        }, 300);
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
        on:change={(e) =>
            saveSettings(() => {
                showDm = e.detail.show;
            })}
        show={showDm}
        connected={connectedDm}
    >
        DMs
    </CategoryToggle>
    <CategoryToggle
        on:change={(e) =>
            saveSettings(() => {
                showPublic = e.detail.show;
            })}
        show={showPublic}
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
                            saveSettings(() => {
                                hiddenInstances.set(
                                    instance.id,
                                    !hiddenInstances.get(instance.id),
                                );
                                hiddenInstances = hiddenInstances;
                            });
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
                            saveSettings(() => {
                                tabView = i + 1;
                            });
                        }}
                        value={`${i + 1}`}
                    >
                        {#if i == 0}
                            Combined View
                        {:else}
                            {i + 1}-Column View
                        {/if}
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
                            saveSettings(() => {
                                toxicityLevel = level;
                            });
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
                        saveSettings(() => {
                            showToxicOnly = false;
                        });
                    }}
                    value={`${false}`}
                >
                    Show All Messages
                </DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem
                    on:click={() => {
                        saveSettings(() => {
                            showToxicOnly = true;
                        });
                    }}
                    value={`${true}`}
                >
                    Show Only Toxic Messages
                </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
    </DropdownMenu.Root>
    <div class="flex flex-row items-center mr-auto">
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
                                play(true);
                                saveSettings(() => {
                                    alertSound = sound;
                                });
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
                                play(false);
                                saveSettings(() => {
                                    newMessageSound = sound;
                                });
                            }}
                        >
                            {sound ? sound : "None"}
                        </DropdownMenu.RadioItem>
                    {/each}
                </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    </div>
    {#if left != null && left > 0 && oldGoal != null}
        <div transition:fade class="flex flex-row gap-2 items-center">
            <p class="whitespace-nowrap mt-1">
                <NumberFlow
                    value={oldGoal - left}
                    trend={50}
                    plugins={[]}
                />/{oldGoal}
            </p>
            <Progress class="w-20" value={((oldGoal - left) / oldGoal) * 100} />
        </div>
    {/if}
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
        {#if !transitioning && (tabView <= 1 || (tabView > 1 && !hiddenInstances.get(instance.id ?? "") && filteredMessagesCache.has(instance.id ?? null) && (filteredMessagesCache.get(instance.id ?? null)?.length ?? 0) > 0))}
            <div transition:blur={{ duration: 300 }}>
                <div
                    transition:scale={{
                        duration: 200,
                        start: 0.95,
                        opacity: 1,
                    }}
                >
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
                                {#each filteredMessagesCache.get(instance.id) || [] as item (item.id)}
                                    <ChatMessageItem
                                        animateFlash
                                        on:click={() => {
                                            member = item.from;
                                        }}
                                        {toxicityLevel}
                                        condensed={tabView > 1}
                                        entireHighlight
                                        showFrom
                                        message={item}
                                    />
                                {/each}
                            </List>
                        </div>
                    </Section>
                </div>
            </div>
        {/if}
    {/each}
</div>
