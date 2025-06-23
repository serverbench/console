<script lang="ts">
    import { page } from "$app/state";
    import SimplePicker from "$lib/components/sb/picker/SimplePicker.svelte";
    import ServerHost from "$lib/components/sb/server/ServerHost.svelte";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import type Container from "$lib/sb/machine/Container";
    import type Instance from "$lib/sb/server/Instance";
    import Server from "$lib/sb/server/Server";
    import { ArrowLeft, Loader2 } from "lucide-svelte";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import Console from "./Console.svelte";
    import Status from "./Status.svelte";
    export let server: Server | null = null;
    let instances: Instance[] = [];
    let online = false;
    onMount(async () => {
        if (!server) {
            const id = page.params.serverId;
            server = await Server.get(id);
            instances = await server.getInstances();
            if (instances.length > 0) {
                instanceId = instances[0].id;
                if (instances[0].containers.length > 0) {
                    containerId = instances[0].containers[0].id;
                }
            }
        }
    });

    let instanceId: string | null = null;
    $: instance = instances.find((i) => i.id == instanceId) ?? null;

    let containerId: string | null = null;
    $: container = instance?.containers.find((c) => c.id == containerId);

    let hosting = false;
</script>

{#if server}
    <ServerHost bind:hosting {server} forcedInstance={instance} />
{/if}

<div class="flex flex-row">
    <div class="flex flex-row items-center gap-3">
        <Button variant="secondary" size="icon" href="/servers/manage">
            {#if server}
                <ArrowLeft />
            {:else}
                <Loader2 class="animate-spin" />
            {/if}
        </Button>
        {#if server}
            <span transition:fade={{ duration: 200 }}>
                {server.slug}
            </span>
        {/if}
    </div>
    {#if server && instance}
        <div
            transition:fade={{ duration: 200 }}
            class="flex flex-row ml-auto gap-2 items-center"
        >
            <div class="min-w-40">
                <SimplePicker
                    disabled={instances.length <= 0}
                    name="Instance"
                    bind:value={instanceId}
                    items={instances.map((i) => [i.id, i.name ?? "default"])}
                />
            </div>
            {#if instance}
                {#if !instance.containers || instance.containers.length <= 0}
                    <Button on:click={() => (hosting = true)}>Host Now</Button>
                {:else}
                    <SimplePicker
                        name="Container"
                        bind:value={containerId}
                        items={instance.containers.map((c) => [c.id, c.id])}
                    />
                {/if}
                {#key container}
                    {#if container}
                        <Status
                            on:online={(o) => (online = o.detail)}
                            {container}
                        />
                    {/if}
                {/key}
            {/if}
        </div>
    {/if}
</div>
{#key container}
    {#if container}
        <Console {online} {container} />
    {/if}
{/key}
