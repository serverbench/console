<script lang="ts">
    import type Server from "$lib/sb/server/Server";
    import { Badge } from "$lib/components/ui/badge";
    import StatusIndicator from "./statusIndicator.svelte";
    import type { state } from "$lib";
    import {
        Trash2,
        ChevronsLeftRightEllipsis,
        ServerCog,
        Loader2,
    } from "lucide-svelte/icons";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import { createEventDispatcher } from "svelte";
    import SetupInstructions from "./SetupInstructions.svelte";
    import Item from "../section/list/Item.svelte";
    import DropdownItem from "../section/list/DropdownItem.svelte";
    import ServerHost from "./ServerHost.svelte";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import type Instance from "$lib/sb/server/Instance";
    import List from "../section/list/list.svelte";

    const dispatch = createEventDispatcher();

    export let server: Server,
        status: state = "unknown";

    let deleting = false;

    let loading = false;

    export let settingUp = false;
    let selecting = false;

    async function remove() {
        loading = true;
        try {
            await server.remove();
            dispatch("removed");
        } catch (error) {}
        loading = false;
    }
    let hosting = false;
    let instances: Instance[] | null = null;

    async function loadInstances() {
        selecting = true;
        instances = null;
        instances = await server.getInstances();
    }
</script>

<ServerHost bind:hosting {server} />

<AlertDialog.Root bind:open={deleting}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title
                >Are you sure you want to delete {server.slug}?</AlertDialog.Title
            >
            <AlertDialog.Description>
                This action cannot be undone. This will permanently delete {server.slug}
                and remove the data from our servers.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action on:click={() => remove()} class="destructive"
                >Continue</AlertDialog.Action
            >
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<AlertDialog.Root bind:open={settingUp}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Let's connect {server.slug}!</AlertDialog.Title>
            <AlertDialog.Description>
                In order to sync your server info with serverbench, you'll need
                to setup our plugin
            </AlertDialog.Description>
            <SetupInstructions />
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action disabled>Waiting...</AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<Dialog.Root bind:open={selecting}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title class="mb-2">{server.slug} instances</Dialog.Title>
            <Dialog.Description>
                {#if instances}
                    <List>
                        {#each instances as instance}
                            <Item
                                href="/servers/manage/{server.id}/instance/{instance.id}"
                            >
                                <div
                                    class="grow"
                                    class:italic={instance.name == null}
                                >
                                    {instance.name ?? "default"}
                                </div>
                                {#if instance.containers.length > 0}
                                    <Badge>
                                        {instance.containers.length}
                                        container{instance.containers.length > 1
                                            ? "s"
                                            : ""}
                                    </Badge>
                                {/if}
                            </Item>
                        {/each}
                    </List>
                {:else}
                    <Loader2 class="animate-spin my-16 mx-auto" />
                {/if}
            </Dialog.Description>
        </Dialog.Header>
    </Dialog.Content>
</Dialog.Root>

<Item on:click={() => loadInstances()} {loading} name={server.slug}>
    <div>
        <StatusIndicator {status} />
    </div>
    <div>{server.slug}</div>
    <div class="ml-auto">
        <Badge variant="secondary">
            {server.instanceCount} instances
        </Badge>
    </div>
    <div slot="dropdown">
        <DropdownItem on:click={() => (settingUp = true)}>
            <ChevronsLeftRightEllipsis />
            <span>Setup</span>
        </DropdownItem>
        <DropdownItem on:click={() => (hosting = true)}>
            <ServerCog />
            <span>Host</span>
        </DropdownItem>
        <DropdownItem destructive on:click={() => (deleting = true)}>
            <Trash2 />
            <span>Delete</span>
        </DropdownItem>
    </div>
</Item>
