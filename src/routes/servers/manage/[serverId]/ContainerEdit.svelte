<script lang="ts">
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import Section from "$lib/components/sb/section/section.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import type Container from "$lib/sb/machine/Container";
    import { Policy } from "$lib/sb/machine/IPort";
    import type IPort from "$lib/sb/machine/IPort";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import {
        Ban,
        CircleCheck,
        Earth,
        EarthLock,
        Heart,
        Loader2,
        Lock,
        Plus,
        Save,
        Trash2,
    } from "lucide-svelte";
    import * as Card from "$lib/components/ui/card/index.js";
    import { onMount } from "svelte";
    import SimplePicker from "$lib/components/sb/picker/SimplePicker.svelte";
    import { isIP, isIPv4, isIPv6 } from "is-ip";
    import List from "$lib/components/sb/section/list/list.svelte";
    import type Repository from "$lib/sb/ci/Repository";
    let ports: IPort[] = [];
    let envs: [string, string][] = [];
    let image = "";
    let mount: string = "";
    let memory: number | null = null;
    let cpus: number | null = null;
    let repository: Repository | null = null;
    let branch: string | null = null;
    export let container: Container;

    onMount(() => {
        ports = container.ports.map((p) => p.asObject());
        envs = Object.entries(container.envs);
        image = container.image;
        mount = container.mount;
        memory = container.memory;
        cpus = container.cpus;
        repository = container.repository;
        branch = container.branch;
    });

    $: invalidRemotes = () => {
        if (firewall == null) return false;
        return firewall.remotes
            .map(
                (r) => !r || r.trim().length <= 0 || (!isIPv4(r) && !isIPv6(r)),
            )
            .some((e) => e);
    };

    function updatePort() {
        if (firewall == null) return;
        const portIndex = ports.findIndex((p) => p.port == firewall!.port);
        if (portIndex !== -1) {
            ports[portIndex] = firewall;
            ports = [...ports]; // Trigger reactivity
        }
        remotes = false;
    }

    let remotes = false;
    let firewall: IPort | null = null;
    let loading = false;

    async function save(updatePorts:boolean, updateEnvs:boolean) {
        loading = true;
        try {
            await container.update(
                image,
                mount,
                memory,
                cpus,
                updatePorts ? ports.map((p) => {
                    p.port = Number(p.port);
                    return p;
                }) : container.ports.map((p) => p.asObject()),
                updateEnvs ? Object.fromEntries(envs) : container.envs,
                repository,
                branch,
            );
        } catch (e) {
            console.error("Failed to save ports:", e);
        } finally {
            loading = false;
        }
    }
</script>

<Dialog.Root bind:open={remotes}>
    <Dialog.Content>
        {#if firewall != null}
            <Dialog.Header>
                <Dialog.Title
                    >Port {firewall.port} ({firewall.name})</Dialog.Title
                >
            </Dialog.Header>
            <div class="flex flex-col gap-2">
                <SimplePicker
                    bind:value={firewall.policy}
                    items={[
                        ["ACCEPT", "Accept (public)"],
                        ["DROP", "Drop (private)"],
                    ]}
                    name="Policy"
                />
                <p
                    class="text-center text-sm text-muted-foreground flex flex-row items-center justify-center"
                >
                    {#if firewall.policy == "ACCEPT"}
                        <Ban class="inline mr-2" />
                        Blacklisted Remotes:
                    {:else}
                        <CircleCheck class="inline mr-2" />
                        Whitelisted Remotes:
                    {/if}
                </p>
                <Card.Root class="flex flex-col gap-2 p-3 h-60 overflow-y-auto">
                    <Button
                        on:click={() => {
                            if (firewall)
                                firewall.remotes = [...firewall.remotes, ""];
                        }}
                    >
                        Add {firewall.policy == "ACCEPT"
                            ? "Blacklisted"
                            : "Whitelisted"} Remote
                    </Button>
                    {#each firewall.remotes as remote}
                        <div class="flex flex-row gap-2 items-center">
                            <Input
                                bind:value={remote}
                                placeholder="Remote IPv4/IPv6"
                                class="grow"
                            />
                            <Button
                                on:click={() =>
                                    firewall &&
                                    (firewall.remotes = firewall.remotes.filter(
                                        (e) => e != remote,
                                    ))}
                                variant="destructive"
                            >
                                <Trash2 />
                            </Button>
                        </div>
                    {/each}
                </Card.Root>
            </div>
            <Dialog.Footer>
                <Button
                    disabled={invalidRemotes()}
                    on:click={() => updatePort()}
                >
                    Close
                </Button>
            </Dialog.Footer>
        {/if}
    </Dialog.Content>
</Dialog.Root>

<Section small name="Ports">
    <div
        class:pb-3={!ports || ports.length <= 0}
        class="pt-3 px-4 flex flex-row gap-2 justify-between items-center w-full content-between"
    >
        <Button
            on:click={() =>
                (ports = [
                    ...ports,
                    { name: "", port: 0, remotes: [], policy: Policy.ACCEPT },
                ])}
            size="icon"
            variant="secondary"
        >
            <Plus />
        </Button>
        <Button disabled={loading} on:click={() => save(true, false)}>
            {#if loading}
                <Loader2 class="animate-spin" />
            {:else}
                Save
            {/if}
            <Save />
        </Button>
    </div>
    <div class="overflow-hidden overflow-y-auto max-h-96">
        <List hideBorder>
            {#each ports as port, i}
                <Item hideBottom={i == ports.length - 1}>
                    <Button
                        on:click={() =>
                            (ports = ports.filter((p) => p.port != port.port))}
                        variant="destructive"
                        size="icon"
                    >
                        <Trash2 />
                    </Button>
                    <Input class="max-w-24" bind:value={port.name} />
                    <Input
                        class="max-w-24"
                        bind:value={port.port}
                        type="number"
                        min="24"
                    />
                    <Button
                        class="ml-auto"
                        on:click={() => {
                            firewall = port;
                            remotes = true;
                        }}
                        variant="secondary"
                    >
                        {#if port.policy == Policy.DROP}
                            Private
                            <EarthLock />
                        {:else}
                            Public
                            <Earth />
                        {/if}
                    </Button>
                </Item>
            {/each}
        </List>
    </div>
</Section>

<Section small name="Environment Variables">
    <div
        class:pb-3={!envs || Object.keys(envs).length <= 0}
        class="pt-3 px-4 flex flex-row gap-2 justify-between items-center w-full content-between"
    >
        <Button
            on:click={() => (envs = [...envs, ["", ""]])}
            size="icon"
            variant="secondary"
        >
            <Plus />
        </Button>
        <Button disabled={loading} on:click={() => save(false, true)}>
            {#if loading}
                <Loader2 class="animate-spin" />
            {:else}
                Save
            {/if}
            <Save />
        </Button>
    </div>
    <List hideBorder>
        {#each envs as _, i}
            <Item>
                <Button
                    size="icon"
                    class="aspect-square"
                    on:click={() => {
                        envs = envs.filter((e) => e[0] != envs[i][0]);
                    }}
                    variant="destructive"
                >
                    <Trash2 />
                </Button>
                <Input
                    bind:value={envs[i][0]}
                    placeholder="Variable Name"
                    class="grow"
                />
                <Input
                    bind:value={envs[i][1]}
                    placeholder="Variable Value"
                    class="grow"
                />
            </Item>
        {/each}
    </List>
</Section>
