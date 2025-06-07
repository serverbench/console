<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import Instance from "$lib/sb/server/Instance";
    import type Server from "$lib/sb/server/Server";
    import {
        Ban,
        CircleCheck,
        Earth,
        Globe,
        GlobeLock,
        Loader2,
        Trash2,
    } from "lucide-svelte";
    import SimplePicker from "../picker/SimplePicker.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import * as Alert from "$lib/components/ui/alert";
    import Machine from "$lib/sb/machine/Machine";
    import MachineSetup from "../../../../routes/me/machines/MachineSetup.svelte";
    import { Progress } from "$lib/components/ui/progress";
    import { isIP, isIPv6 } from "is-ip";
    import { presets, type Preset } from "./presets";
    export let hosting = false,
        server: Server;
    type Env = {
        key: string;
        value: string;
    };
    type Port = {
        policy: "drop" | "allow";
        remotes: string[];
        name: string;
        value: number | null;
    };
    let managingFirewall = false;
    let firewall: Port | null = null;
    let ports: Port[] = [];
    let envs: Env[] = [];
    let mount: string | null = null;
    let image: string | null = null;
    let machines: Machine[] | null = null;
    let machine: Machine | null = null;
    let instances: Instance[] | null = null;
    let instance: Instance | null = null;
    let instanceName: string | null = null;
    let memory: number | null = null;
    let step = 1;
    let steps = 2;
    const memoryOptions: [number, string][] = [
        [1024 * 1024 * 1024, "GB"],
        [1024 * 1024, "MB"],
    ];
    let memoryUnit = memoryOptions[0][0];
    let cpus: null | number = null;

    async function fetchInstances() {
        instance = null;
        instances = null;
        instances = await server.getInstances();
        instance = instances[0] ?? null;
    }

    async function fetchMachines() {
        machine = null;
        machines = null;
        const machineList = await Machine.list();
        if (machineList.length <= 0) {
            machineList.push(await Machine.create());
        }
        machines = machineList;
        machine = machines[0] ?? null;
    }

    function nextStep() {
        if (step < steps) {
            step++;
        }
    }

    function reset() {
        step = 1;
        instance = null;
        instanceName = null;
        machine = null;
        memory = null;
        memoryUnit = memoryOptions[0][0];
        cpus = null;
        envs = [];
        ports = [];
        mount = null;
        addEnv();
        addPort();
    }

    async function host() {}

    function addEnv() {
        envs.push({ key: "", value: "" });
        envs = envs;
    }

    function addPort() {
        ports.push({ name: "", value: null, policy: "allow", remotes: [] });
        ports = ports;
    }

    $: missingDetails = () => {
        if (step == 1) {
            if (instance == null) return true;
            if (machine == null) return true;
            if (!machine.hardware?.hostname) return true;
        } else if (step == 2) {
        }
        return false;
    };

    $: missingSteps = () => {
        return step < steps;
    };

    $: items = () =>
        (instances
            ? instances.map((instance): [Instance | null, string] => [
                  instance,
                  instance.name ?? "default",
              ])
            : []
        ).concat([[null, "New Instance"]]);

    $: machineItems = () =>
        machines
            ? machines.map((machine): [Machine, string] => [
                  machine,
                  `${machine.hardware?.hostname ?? machine.id} ${machine.created.toLocaleString()}`,
              ])
            : [];

    $: invalidRemotes = () => {
        if (firewall == null) return false;
        return firewall.remotes
            .map((r) => !r || r.trim().length <= 0 || (!isIP(r) && !isIPv6(r)))
            .some((e) => e);
    };

    $: presetValues = () => {
        return presets.map((p): [Preset, string, string] => {
            return [p, p.name, p.logo];
        });
    };

    let preset: Preset | null = null;

    $: preset,
        (() => {
            if (preset != null) {
                image = preset!.image;
                mount = preset!.mount;
                ports = Object.keys(preset!.ports).map((e) => ({
                    name: e,
                    value: preset!.ports[e],
                    policy: 'allow',
                    remotes: [],
                }));
                envs = Object.keys(preset!.envs).map((e) => ({
                    key: e,
                    value: preset!.envs[e],
                }));
                preset = null;
            }
        })();

    function updatePort() {
        if (firewall == null) return;
        ports.find(
            (p) => p.name == firewall!.name && p.value == firewall!.value,
        ) != firewall;
        ports = ports;
        managingFirewall = false;
    }

    $: hosting, hosting && reset(), fetchInstances(), fetchMachines();
</script>

<Dialog.Root bind:open={managingFirewall}>
    {#if firewall != null}
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title
                    >Port {firewall.value} ({firewall.name})</Dialog.Title
                >
            </Dialog.Header>
            <div class="flex flex-col gap-2">
                <SimplePicker
                    bind:value={firewall.policy}
                    items={[
                        ["allow", "Allow (public)"],
                        ["drop", "Drop (private)"],
                    ]}
                    name="Policy"
                />
                <p
                    class="text-center text-sm text-muted-foreground flex flex-row items-center justify-center"
                >
                    {#if firewall.policy == "allow"}
                        <Ban class="inline mr-2" />
                        Blacklisted Remotes:
                    {:else}
                        <CircleCheck class="inline mr-2" />
                        Whitelisted Remotes:
                    {/if}
                </p>
                <div
                    class="flex flex-col gap-2 p-3 border h-60 overflow-y-auto"
                >
                    <Button
                        on:click={() => {
                            if (firewall)
                                firewall.remotes = [...firewall.remotes, ""];
                        }}
                    >
                        Add {firewall.policy == "allow"
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
                </div>
            </div>
            <Dialog.Footer>
                <Button
                    disabled={invalidRemotes()}
                    on:click={() => updatePort()}
                >
                    Close
                </Button>
            </Dialog.Footer>
        </Dialog.Content>
    {/if}
</Dialog.Root>

<Dialog.Root bind:open={hosting}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Host {server.slug}</Dialog.Title>
        </Dialog.Header>
        <div class="flex flex-col gap-2">
            <Progress value={(step / (steps + 1)) * 100} />
            {#if step == 1}
                <!-- instance and machine/plan selection -->
                {#if !instances}
                    <Loader2 class="mx-auto animate-spin my-10" />
                {:else if instances != null}
                    <div
                        class="flex flex-col gap-2"
                        class:border={instance == null}
                        class:p-3={instance == null}
                    >
                        <SimplePicker
                            bind:value={instance}
                            items={items()}
                            name="instance"
                        />
                        {#if instance == null}
                            <Input
                                bind:value={instanceName}
                                placeholder={instances.find((i) => !i.name)
                                    ? "Instance Name"
                                    : "default (empty)"}
                            />
                        {/if}
                    </div>
                    <div class="flex flex-col gap-2 border p-3">
                        <Tabs.Root value="self">
                            <Tabs.List class="grid w-full grid-cols-2">
                                <Tabs.Trigger value="self"
                                    >self-hosted</Tabs.Trigger
                                >
                                <Tabs.Trigger value="cloud"
                                    >serverbench cloud</Tabs.Trigger
                                >
                            </Tabs.List>
                            <Tabs.Content value="self">
                                {#if machines != null}
                                    <div class="flex flex-col gap-2">
                                        <div class="flex flex-row gap-2">
                                            <div class="grow">
                                                <SimplePicker
                                                    bind:value={machine}
                                                    items={machineItems()}
                                                    name="Machine"
                                                />
                                            </div>
                                            <Button
                                                variant="secondary"
                                                href="/me/machines"
                                            >
                                                Manage
                                            </Button>
                                        </div>
                                        {#if machine}
                                            {#if machine.hardware?.hostname}
                                                <Input
                                                    class="grow"
                                                    min="1"
                                                    max={machine.hardware.cpus
                                                        .length}
                                                    bind:value={cpus}
                                                    type="number"
                                                    placeholder={`${machine.hardware.cpus.reduce((sum, c) => sum + (c.cores > 0 ? c.cores : 1), 0)} vCPUs`}
                                                />
                                                <div
                                                    class="flex flex-row gap-2"
                                                >
                                                    <Input
                                                        class="grow"
                                                        min="1"
                                                        bind:value={memory}
                                                        type="number"
                                                        placeholder={`${machine.hardware.memory.size > 0 ? Math.trunc(machine.hardware.memory.size / memoryUnit) : "∞"} ${memoryOptions.find((o) => o[0] == memoryUnit)?.[1] ?? "B"}`}
                                                    />
                                                    <div class="w-32">
                                                        <SimplePicker
                                                            bind:value={
                                                                memoryUnit
                                                            }
                                                            items={memoryOptions}
                                                            name="Unit"
                                                        />
                                                    </div>
                                                </div>
                                            {:else}
                                                <MachineSetup {machine} />
                                                <Button
                                                    on:click={() =>
                                                        fetchMachines()}
                                                >
                                                    I've set up my machine
                                                </Button>
                                            {/if}
                                        {/if}
                                    </div>
                                {:else}
                                    <Loader2
                                        class="mx-auto animate-spin my-10"
                                    />
                                {/if}
                            </Tabs.Content>
                            <Tabs.Content value="cloud">
                                <Alert.Root>
                                    <Alert.Title>Coming soon!</Alert.Title>
                                    <Alert.Description>
                                        serverbench cloud hosting is not yet
                                        available. Please use the self-hosted
                                        option for now.
                                    </Alert.Description>
                                </Alert.Root>
                            </Tabs.Content>
                        </Tabs.Root>
                    </div>
                {/if}
            {:else if step == 2}
                <!-- app setup -->
                <SimplePicker
                    images
                    items={presetValues()}
                    bind:value={preset}
                    name="Preset"
                />
                <Input
                    bind:value={image}
                    placeholder="docker.io/<namespace>/<image>:<tag>"
                />
                <Input bind:value={mount} placeholder="/data" />
                <div
                    class="flex flex-col gap-2 p-3 border overflow-y-auto h-60"
                >
                    <Tabs.Root value="ports">
                        <Tabs.List class="grid w-full grid-cols-2">
                            <Tabs.Trigger value="ports">ports</Tabs.Trigger>
                            <Tabs.Trigger value="envs">envs</Tabs.Trigger>
                        </Tabs.List>
                        <Tabs.Content value="ports">
                            <div class="flex flex-col gap-2">
                                <Button on:click={() => addPort()}
                                    >Add Port</Button
                                >
                                {#each ports as port}
                                    <div
                                        class="flex flex-row gap-2 items-center"
                                    >
                                        <Input
                                            bind:value={port.name}
                                            placeholder="Name"
                                            class="grow"
                                        />
                                        <Input
                                            bind:value={port.value}
                                            type="number"
                                            placeholder="Port"
                                            class="grow"
                                        />
                                        <Button
                                            disabled={port.name == null ||
                                                port.value == null ||
                                                ports.filter(
                                                    (p) => p.name == port.name,
                                                ).length > 1}
                                            on:click={() => {
                                                firewall = port;
                                                managingFirewall = true;
                                            }}
                                            variant="secondary"
                                        >
                                            {#if port.policy == "allow"}
                                                <Globe />
                                            {:else}
                                                <GlobeLock />
                                            {/if}
                                        </Button>
                                        <Button
                                            on:click={() =>
                                                (ports = ports.filter(
                                                    (e) => e != port,
                                                ))}
                                            disabled={ports.length <= 1}
                                            variant="destructive"
                                        >
                                            <Trash2 />
                                        </Button>
                                    </div>
                                {/each}
                            </div>
                        </Tabs.Content>
                        <Tabs.Content value="envs">
                            <div class="flex flex-col gap-2">
                                <Button on:click={() => addEnv()}
                                    >Add Environment Variable</Button
                                >
                                {#each envs as env}
                                    <div
                                        class="flex flex-row gap-2 items-center"
                                    >
                                        <Input
                                            bind:value={env.key}
                                            placeholder="Key"
                                            class="grow"
                                        />
                                        <Input
                                            bind:value={env.value}
                                            placeholder="Value"
                                            class="grow"
                                        />
                                        <Button
                                            on:click={() =>
                                                (envs = envs.filter(
                                                    (e) => e != env,
                                                ))}
                                            disabled={envs.length <= 1}
                                            variant="destructive"
                                        >
                                            <Trash2 />
                                        </Button>
                                    </div>
                                {/each}
                            </div>
                        </Tabs.Content>
                    </Tabs.Root>
                </div>
            {/if}
        </div>
        <Dialog.Footer>
            <Button
                on:click={() => (missingSteps() ? nextStep() : host())}
                disabled={missingDetails()}
                type="submit"
            >
                {#if missingSteps()}
                    Next
                {:else}
                    Host
                {/if}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
