<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import type Container from "$lib/sb/machine/Container";
    import {
        CirclePlay,
        Crosshair,
        Loader2,
        Pause,
        Play,
        RotateCcw,
        Square,
    } from "lucide-svelte";
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import { Root } from "$lib/components/ui/accordion";
    import type { PowerState } from "$lib/sb/machine/Container";
    import { scale } from "svelte/transition";

    const runningStates = ["running"];
    const stateChange = ["restarting", "removing"];
    const pausedStates = ["paused"];
    $: running = status ? runningStates.includes(status) : false;
    $: paused = status ? pausedStates.includes(status) : false;
    $: stopped = status ? !running && !paused : false;
    $: changing =
        expectingChange || (status ? stateChange.includes(status) : false);

    const dispatcher = createEventDispatcher();

    $: running,
        paused,
        stopped,
        dispatcher("online", running),
        (expectingChange = expectingChange && running == fromRunning),
        (showKill = showKill && !stopped);

    export let container: Container;
    export let status: string | null = null;
    let ws: WebSocket | null = null;
    let exit = false;
    let loading = false;
    onMount(async () => {
        await loadStatus();
    });

    async function loadStatus() {
        if (loading) return;
        loading = true;
        ws = await container.status(
            (s) => {
                status = s;
            },
            async () => {
                loading = false;
                status = null;
                if (!exit) {
                    await loadStatus();
                }
            },
        );
    }

    onDestroy(() => {
        exit = true;
        if (ws) {
            ws.close();
        }
    });

    let expectingChange = false;
    let fromRunning = false;
    let showKill = false;

    async function state(state: PowerState) {
        if (expectingChange && state != "kill") return;
        fromRunning = running;
        expectingChange = true;
        showKill = state == "stop";
        await container.power(state);
    }
</script>

<div class="flex flex-row gap-2 items-center">
    {#if showKill}
        <div class="inline-block" transition:scale>
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <Button
                        on:click={() => state("kill")}
                        size="icon"
                        class="bg-red-900 hover:bg-red-950 text-white"
                    >
                        <Crosshair />
                    </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>Kill container</p>
                </Tooltip.Content>
            </Tooltip.Root>
        </div>
    {/if}
    <Tooltip.Root>
        <Tooltip.Trigger>
            <Button
                on:click={() => state("stop")}
                size="icon"
                disabled={stopped || changing || paused}
                class="bg-red-200 hover:bg-red-100 text-red-900"
            >
                {#if (stopped || showKill) && changing}
                    <Loader2 class="animate-spin" />
                {:else}
                    <Square />
                {/if}
            </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
            <p>Stop container</p>
        </Tooltip.Content>
    </Tooltip.Root>
    <Tooltip.Root>
        <Tooltip.Trigger>
            <Button
                on:click={() => state(running ? "restart" : "start")}
                size="icon"
                disabled={changing || paused}
                class="bg-green-200 hover:bg-green-100 text-green-900"
            >
                {#if running && changing && !showKill}
                    <Loader2 class="animate-spin" />
                {:else if stopped || status == null}
                    <CirclePlay />
                {:else if running || paused}
                    <RotateCcw />
                {/if}
            </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
            <p>{running ? "Restart" : "Start"} container</p>
        </Tooltip.Content>
    </Tooltip.Root>
    <Tooltip.Root>
        <Tooltip.Trigger>
            <Button
                on:click={() => state(paused ? "unpause" : "pause")}
                size="icon"
                disabled={changing || stopped}
            >
                {#if paused && changing}
                    <Loader2 class="animate-spin" />
                {:else if paused}
                    <CirclePlay />
                {:else}
                    <Pause />
                {/if}
            </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
            <p>{paused ? "Resume" : "Pause"} container</p>
        </Tooltip.Content>
    </Tooltip.Root>
</div>
