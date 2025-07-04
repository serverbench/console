<script lang="ts">
    import { page } from "$app/state";
    import SimplePicker from "$lib/components/sb/picker/SimplePicker.svelte";
    import ServerHost from "$lib/components/sb/server/ServerHost.svelte";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import type Container from "$lib/sb/machine/Container";
    import type Instance from "$lib/sb/server/Instance";
    import Server from "$lib/sb/server/Server";
    import { ArrowLeft, Files, Loader2 } from "lucide-svelte";
    import { onMount, tick } from "svelte";
    import { fade } from "svelte/transition";
    import Console from "./Console.svelte";
    import Status from "./Status.svelte";
    import Password from "./Password.svelte";
    import Section from "$lib/components/sb/section/section.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
    import User from "$lib/sb/User";
    import ContainerEdit from "./ContainerEdit.svelte";
    import { sort } from "fast-sort";
    export let server: Server | null = null;
    let instances: Instance[] = [];
    let online = false;
    let preferedContainer: string | null = null;
    onMount(async () => {
        if (!server) {
            const id = page.params.serverId;
            const preferedInstance = page.url.searchParams.get("instance");
            preferedContainer = page.url.searchParams.get("container");
            server = await Server.get(id);
            instances = sort(await server.getInstances()).by([
                {
                    desc: i=>i.containers.filter(c => c.deleted == null).length,
                }
            ]);
            if (instances.length > 0) {
                instanceId =
                    instances.find((i) => i.id == preferedInstance)?.id ??
                    instances[0].id ??
                    null;
            }
        }
    });

    let instance: Instance | null = null;
    let containers: Container[] = [];
    let container: Container | null = null;

    $: instanceId,
        (() => {
            instance = instances.find((i) => i.id == instanceId) ?? null;
            containers =
                instance?.containers.filter((c) => c.deleted == null) ?? [];
            container =
                containers.find((c) => c.id == preferedContainer) ??
                containers[0] ??
                null;
        })();

    let instanceId: string | null = null;

    $: items = (instance?.containers.map((c) => [c.id, c.label]) ?? []) as [
        string,
        string,
    ][];

    let hosting = false;

    let deleting = false;
    let status: string | null = null;

    async function remove(container: Container | null) {
        await container!.delete();
        containers = containers.filter((c) => c.id != container!.id);
        // reload website
        window.location.reload();
    }
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
                {#if !instance.containers || instance.containers.filter((c) => c.deleted == null).length <= 0}
                    <Button on:click={() => (hosting = true)}>Host Now</Button>
                {:else}
                    {#key containers}
                        <SimplePicker
                            name="Container"
                            {items}
                            on:change={(c) =>
                                (container =
                                    containers.find((i) => i.id == c.detail) ??
                                    null)}
                            value={container?.id ?? null}
                        />
                    {/key}
                {/if}
                {#key container}
                    {#if container}
                        <Status
                            bind:status
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
        {#if status}
            <Console {online} {container} />
        {:else}
            <Skeleton class="h-96" />
        {/if}
        <Section name="access">
            <div>
                <div class="flex flex-row gap-2">
                    <div class="w-full">
                        <Label>Address</Label>
                        <Input readonly bind:value={container.address} />
                    </div>
                    <div>
                        <Label>Port</Label>
                        <Input readonly value="23" type="number" />
                    </div>
                </div>
            </div>
            <div class="flex flex-row gap-2 items-center">
                <div class="w-full">
                    <AlertDialog.Root>
                        <AlertDialog.Trigger asChild let:builder>
                            <Button builders={[builder]} variant="destructive"
                                >Delete</Button
                            >
                        </AlertDialog.Trigger>
                        <AlertDialog.Content>
                            <AlertDialog.Header>
                                <AlertDialog.Title
                                    >Are you absolutely sure?</AlertDialog.Title
                                >
                                <AlertDialog.Description>
                                    This action cannot be undone. This will
                                    permanently delete your container and remove
                                    your data from the server.
                                </AlertDialog.Description>
                            </AlertDialog.Header>
                            <AlertDialog.Footer>
                                <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                                {#if container.id}
                                    <AlertDialog.Action
                                        on:click={() => remove(container)}
                                        >Continue</AlertDialog.Action
                                    >
                                {/if}
                            </AlertDialog.Footer>
                        </AlertDialog.Content>
                    </AlertDialog.Root>
                </div>
                <Password {container} />
                <a href={`sftp://${container.id}@${container.address}:23`}>
                    <Button>
                        Open sFTP
                        <Files />
                    </Button>
                </a>
            </div>
        </Section>
        <ContainerEdit {container} />
    {/if}
{/key}
