<script lang="ts">
    import type Server from "$lib/sb/server/Server";
    import { Badge } from "$lib/components/ui/badge";
    import StatusIndicator from "./statusIndicator.svelte";
    import type { state } from "$lib";
    import { Trash2, ChevronsLeftRightEllipsis } from "lucide-svelte/icons";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import { createEventDispatcher } from "svelte";
    import SetupInstructions from "./SetupInstructions.svelte";
    import Item from "../section/list/Item.svelte";
    import DropdownItem from "../section/list/DropdownItem.svelte";

    const dispatch = createEventDispatcher();

    export let server: Server,
        status: state = "unknown";

    let deleting = false;

    let loading = false;

    export let settingUp = false;

    async function remove() {
        loading = true;
        try {
            await server.remove();
            dispatch("removed");
        } catch (error) {}
        loading = false;
    }
</script>

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

<Item {loading} name={server.slug}>
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
        <DropdownItem destructive on:click={() => (deleting = true)}>
            <Trash2 />
            <span>Delete</span>
        </DropdownItem>
    </div>
</Item>
