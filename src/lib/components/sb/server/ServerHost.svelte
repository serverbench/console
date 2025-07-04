<script lang="ts">
    import { onMount } from "svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import Instance from "$lib/sb/server/Instance";
    import type Server from "$lib/sb/server/Server";
    import { expandCidr } from "cidr-tools";
    import {
        ArrowLeft,
        Ban,
        Check,
        CircleCheck,
        Github,
        Globe,
        GlobeLock,
        Loader2,
        Plus,
        RotateCw,
        Trash2,
        User,
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
    import { blur, slide } from "svelte/transition";
    import type IPort from "$lib/sb/machine/IPort";
    import * as Card from "$lib/components/ui/card";
    import Developer from "$lib/sb/ci/Developer";
    import type { ContainerLabel } from "$lib/sb/machine/Container";

    export let hosting = false;
    export let server: Server;
    export let forcedInstance: Instance | null = null;

    type Env = {
        key: string;
        value: string;
    };

    type Port = {
        policy: "DROP" | "ACCEPT";
        remotes: string[];
        name: string;
        value: number | null;
    };

    let label: ContainerLabel = "prod";
    let managingFirewall = false;
    let firewall: Port | null = null;
    let ports: Port[] = [];
    let envs: Env[] = [];
    let mount: string | null = null;
    let image: string | null = null;
    let machines: Machine[] | null = null;
    let machine: string | null = null;
    let instances: Instance[] | null = null;
    let instanceId: string | null = null;
    let instanceName: string | null = null;
    let memory: number | null = null;
    let step = 1;
    let steps = 2;
    let loading = false;
    let ip: string | null = null;
    let preset: Preset | null = null;
    let cpus: null | number = null;
    let command: string | null = null;

    const memoryOptions: [number, string][] = [
        [1000, "GB"],
        [1, "MB"],
    ];
    let memoryUnit = memoryOptions[0][0];

    async function fetchInstances() {
        instanceId = forcedInstance ? forcedInstance.id : null;
        instances = forcedInstance ? [forcedInstance] : null;
        if (!forcedInstance) {
            instances = await server.getInstances();
            instanceId = instances[0].id ?? null;
        }
    }

    async function fetchMachines() {
        machine = null;
        machines = null;
        const machineList = await Machine.list();
        if (machineList.length <= 0) {
            machineList.push(await Machine.create());
        }
        machines = machineList;
        machine =
            (machines.filter((m) => m.hardware)[0] ?? machines[0])?.id ?? null;
        console.log("Machines fetched", machines);
    }

    function reset() {
        step = 1;
        instanceId = null;
        instanceName = null;
        machine = null;
        memory = null;
        memoryUnit = memoryOptions[0][0];
        cpus = null;
        envs = [];
        ports = [];
        mount = null;
        ip = null;
        preset = null;
        image = null;
        firewall = null;
        managingFirewall = false;
        label = "prod";
        addEnv();
        addPort();
    }

    function addEnv() {
        envs = [...envs, { key: "", value: "" }];
    }

    function addPort() {
        ports = [
            ...ports,
            { name: "", value: null, policy: "ACCEPT", remotes: [] },
        ];
    }

    async function next() {
        if (loading) return;

        loading = true;
        try {
            if (step == 1) {
                if (instanceId == null) {
                    const nameIsNull =
                        !instanceName || instanceName.trim().length <= 0;
                    if (instances?.find((i) => i.name == null) && nameIsNull) {
                        throw new Error(
                            "Please provide a name for the new instance.",
                        );
                    }
                    const newinstance = await server.createInstance(
                        nameIsNull ? null : instanceName,
                    );
                    instances = [...(instances || []), newinstance];
                    instanceId = newinstance.id;
                }
            } else if (step == 2) {
                const selectedInstance = instances?.find(
                    (i) => i.id == instanceId,
                );
                const container = await selectedInstance!.host(
                    selectedMachine!,
                    image!,
                    mount!,
                    ip!,
                    memory,
                    cpus,
                    ports
                        .filter((p) => p.value != null)
                        .map(
                            (p): IPort => ({
                                name: p.name,
                                port: Number(p.value!),
                                policy: p.policy,
                                remotes: p.remotes,
                            }),
                        ),
                    envs.reduce((acc, e) => ({ ...acc, [e.key]: e.value }), {}),
                    repo,
                    repo ? branch : null,
                    label,
                    (command && command.trim().length > 0) ? command : null,
                );
                window.location.href = `/servers/manage/${server.id}?instance=${selectedInstance!.id}&container=${container.id}`;
            }
            step = step + 1;
        } catch (error) {
            console.error("Error in next():", error);
        } finally {
            loading = false;
        }
    }

    function updatePort() {
        if (firewall == null) return;
        const portIndex = ports.findIndex(
            (p) => p.name == firewall!.name && p.value == firewall!.value,
        );
        if (portIndex !== -1) {
            ports[portIndex] = firewall;
            ports = [...ports]; // Trigger reactivity
        }
        managingFirewall = false;
    }

    // FIXED: Proper reactive handling to prevent infinite loops
    async function handleHostingChange() {
        if (hosting) {
            reset();
            try {
                await Promise.all([
                    fetchInstances(),
                    fetchMachines(),
                    loadDeveloperProfiles(),
                ]);
            } catch (error) {
                console.error("Error initializing hosting:", error);
            }
        }
    }

    // Reactive statements
    $: selectedMachine = machines?.find((m) => m.id == machine) ?? null;

    $: missingDetails = () => {
        if (step == 1) {
            if (
                instanceId == null &&
                (instances || []).find((i) => i.name == null) &&
                (instanceName == null || instanceName.trim().length <= 0)
            )
                return true;
            if (selectedMachine == null) return true;
            if (!selectedMachine?.hardware?.hostname) return true;
        } else if (step == 2) {
            if (ip == null) return true;
            if (image == null) return true;
            if (mount == null) return true;
            if (ports.find((p) => p.name == null && p.value != null))
                return true;
            if (ports.find((p) => p.name != null && p.value == null))
                return true;
            if (envs.find((e) => e.key == null && e.value != null)) return true;
            if (envs.find((e) => e.key != null && e.value == null)) return true;
        }
        return false;
    };

    $: missingSteps = () => {
        return step < steps;
    };

    $: items = () =>
        instances
            ? instances.map((instance): [string | null, string] => {
                  return [instance.id, instance.name ?? "default"];
              })
            : [];

    const labels: [string, string][] = [
        ["prod", "Production"],
        ["dev", "Development"],
        ["test", "Testing"],
        ["staging", "Staging"],
    ];

    $: machineItems = () =>
        machines
            ? machines.map((machine): [string, string] => [
                  machine.id,
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

    function ips() {
        const ifaces = selectedMachine?.hardware?.interfaces || [];
        const ips: Set<string> = new Set();
        for (const iface of ifaces) {
            for (const cidr of iface.addresses) {
                if (cidr.version == "IPv6") continue;
                for (const ip of Array.from(expandCidr(cidr.ip))) {
                    ips.add(ip);
                }
                console.log(cidr.ip, 2);
            }
        }
        return Array.from(ips).map((i): [string, string] => [i, i]);
    }

    // Handle preset changes
    $: if (preset != null) {
        image = preset.image;
        mount = preset.mount;
        ports = Object.keys(preset.ports).map((e) => ({
            name: e,
            value: preset!.ports[e],
            policy: "ACCEPT",
            remotes: [],
        }));
        envs = Object.keys(preset.envs).map((e) => ({
            key: e,
            value: preset!.envs[e],
        }));
        preset = null;
    }

    let repoId: string | null = null;
    let developerProfiles: Developer[] = [];
    let loadingDeveloper = false;
    let branch: string | null = null;

    $: repo =
        developerProfiles
            .flatMap((d) => d.repositories)
            .find((r) => r.id == repoId) ?? null;

    async function loadDeveloperProfiles(refresh = false) {
        loadingDeveloper = true;
        developerProfiles = await Developer.list(refresh);
        loadingDeveloper = false;
    }

    // FIXED: Safe hosting change handler
    $: if (hosting) {
        handleHostingChange();
    }
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
        </Dialog.Content>
    {/if}
</Dialog.Root>

<Dialog.Root bind:open={hosting}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title
                >Host {server.slug}{forcedInstance
                    ? ` (${forcedInstance.name ?? "default"})`
                    : ""}</Dialog.Title
            >
        </Dialog.Header>
        {#if loading}
            <div class="flex flex-col gap-2">
                <Loader2 class="mx-auto animate-spin my-20" />
            </div>
        {:else if step == 1}
            <div class="flex flex-col gap-2">
                <!-- instance and machine/plan selection -->
                {#if !instances}
                    <Loader2 class="mx-auto animate-spin my-10" />
                {:else if instances != null}
                    {#if !forcedInstance}
                        <Card.Root class="flex flex-col gap-2 p-3">
                            <SimplePicker
                                bind:value={instanceId}
                                items={items()}
                                optional="New Instance"
                                name="instance"
                            />
                            {#if instanceId == null}
                                <Input
                                    bind:value={instanceName}
                                    placeholder={instances.find((i) => !i.name)
                                        ? "Instance Name"
                                        : "default (empty)"}
                                />
                            {/if}
                            <SimplePicker
                                bind:value={label}
                                items={labels}
                                name="Container Label"
                            />
                        </Card.Root>
                    {:else}
                        <SimplePicker
                            bind:value={label}
                            items={labels}
                            name="Container Label"
                        />
                    {/if}
                    <Card.Root class="flex flex-col gap-2 border p-3">
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
                                            {#if selectedMachine?.hardware?.hostname}
                                                <Input
                                                    class="grow"
                                                    min="1"
                                                    max={selectedMachine
                                                        ?.hardware?.cpus
                                                        .length ?? 0}
                                                    bind:value={cpus}
                                                    type="number"
                                                    placeholder={`${selectedMachine?.hardware?.cpus.reduce((sum, c) => sum + (c.cores > 0 ? c.cores : 1), 0) ?? 0} vCPUs`}
                                                />
                                                <div
                                                    class="flex flex-row gap-2"
                                                >
                                                    <Input
                                                        class="grow"
                                                        min="1"
                                                        bind:value={memory}
                                                        type="number"
                                                        placeholder={`${selectedMachine?.hardware?.memory?.size > 0 ? Math.trunc((selectedMachine?.hardware?.memory?.size ?? 0) / memoryUnit) : "∞"} ${memoryOptions.find((o) => o[0] == memoryUnit)?.[1] ?? "B"}`}
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
                                            {:else if selectedMachine}
                                                <MachineSetup
                                                    machine={selectedMachine}
                                                />
                                                <Button
                                                    variant="secondary"
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
                    </Card.Root>
                {/if}
            </div>
        {:else if step == 2}
            <div class="flex flex-col gap-2">
                <SimplePicker items={ips()} bind:value={ip} name="IP" />
                <SimplePicker
                    images
                    items={presetValues()}
                    bind:value={preset}
                    name="Preset"
                />
                <div class="flex flex-row gap-2 items-center">
                    <SimplePicker
                        images
                        optional="No repository"
                        disabled={developerProfiles.length <= 0 ||
                            loadingDeveloper}
                        items={developerProfiles
                            .flatMap((d) => d.repositories)
                            .map((r) => [r.id, r.uri])}
                        bind:value={repoId}
                        name="Repository"
                        on:change={(ev) =>
                            (branch =
                                developerProfiles
                                    .flatMap((d) => d.repositories)
                                    .find((r) => r.id == ev.detail)
                                    ?.branches[0] ?? null)}
                    />
                    <Button
                        variant="secondary"
                        class="aspect-square"
                        size="icon"
                        on:click={() => loadDeveloperProfiles(true)}
                    >
                        {#if loadingDeveloper}
                            <Loader2 class="animate-spin" />
                        {:else}
                            <RotateCw />
                        {/if}
                    </Button>
                    <Button
                        class="aspect-square"
                        size="icon"
                        on:click={() => Developer.link("github")}
                    >
                        <Plus />
                    </Button>
                </div>
                {#key repoId}
                    {#if repoId && repo}
                        <SimplePicker
                            images
                            disabled={developerProfiles.length <= 0 ||
                                loadingDeveloper}
                            items={repo.branches.map((b) => [b, b])}
                            bind:value={branch}
                            name="Branch"
                        />
                    {/if}
                {/key}
                <Input
                    bind:value={image}
                    placeholder="docker.io/<namespace>/<image>:<tag>"
                />
                <Input bind:value={mount} placeholder="/data" />
                <Input bind:value={command} placeholder="Command" />
                <Card.Root
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
                                            {#if port.policy == "ACCEPT"}
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
                </Card.Root>
            </div>
        {:else if step == 3}
            <div transition:blur>
                <Check class="my-20 mx-auto text-emerald-400" />
            </div>
        {/if}
        <Dialog.Footer>
            <div class="flex flex-col gap-2 w-full">
                {#if step <= steps}
                    <div class="flex flex-row gap-2 items-center">
                        {#if step > 1}
                            <Button on:click={() => (step = step - 1)}>
                                <ArrowLeft />
                            </Button>
                        {/if}
                        <Button
                            class="grow"
                            on:click={() => next()}
                            disabled={missingDetails()}
                            type="submit"
                        >
                            {#if missingSteps()}
                                Next
                            {:else}
                                Host
                            {/if}
                        </Button>
                    </div>
                {/if}
                <Progress class="h-1" value={(step / (steps + 1)) * 100} />
            </div>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
