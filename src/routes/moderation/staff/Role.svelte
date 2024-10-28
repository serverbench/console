<script lang="ts">
    import DropdownItem from "$lib/components/sb/section/list/DropdownItem.svelte";
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import Role from "$lib/sb/staff/Role";
    import { Trash2, Pencil, ChevronDown, Plus, X, Mail } from "lucide-svelte";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import { createEventDispatcher } from "svelte";
    import * as Dialog from "$lib/components/ui/dialog";
    import List from "$lib/components/sb/section/list/list.svelte";
    import { ScrollArea } from "$lib/components/ui/scroll-area";
    import * as Card from "$lib/components/ui/card";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
    import ReadWrite from "./ReadWrite.svelte";
    import MemberPicker from "../../community/members/MemberPicker.svelte";
    import Member from "$lib/sb/member/Member";

    const dispatcher = createEventDispatcher();

    export let role: Role;
    let permExploring = false;
    let loadingPerms = false;
    let updatedPermissions: [string, boolean][] = role.permissions.map((p) => {
        const [node, acl] = p.split(":");
        return [node, acl == "rw"];
    });

    let newPermText: string | null = null;
    let newPermWrite: boolean = false;

    let inviting = false;

    async function updateRole() {
        loading = true;
        try {
            role = await role.update(
                role.name,
                updatedPermissions.map(
                    ([node, acl]) => `${node}:${acl ? "rw" : "r"}`,
                ),
                null,
            );
            dispatcher("updated", role);
        } catch (error) {}
        loading = false;
    }

    function pushPerm() {
        updatedPermissions = [
            ...updatedPermissions,
            [newPermText!, newPermWrite],
        ];
        newPermText = null;
    }

    $: permExploring,
        (async () => {
            if (loadingPerms) false;
            loadingPerms = true;
            permissions = await Role.getPermissions();
        })();

    const dispatch = createEventDispatcher();

    let deleting = false;
    let editing = false;
    let loading = false;

    let permissions: string[] = [];

    async function remove() {
        loading = true;
        try {
            await role.delete();
            dispatch("delete");
        } catch (error) {}
        loading = false;
    }

    async function invite() {
        loading = true;
        try {
            await role.invite(invitedMember!);
            invitedMember = null;
            inviting = false
            dispatch("invite");
        } catch (error) {}
        loading = false;
    }

    let invitedMember: Member | null = null;
</script>

<Dialog.Root bind:open={inviting}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Let's add a new {role.name}</Dialog.Title>
        </Dialog.Header>
        <MemberPicker bind:member={invitedMember} />
        <Dialog.Footer>
            <Button variant="outline" on:click={() => (inviting = false)}>
                Cancel
            </Button>
            <Button
                disabled={loading || invitedMember == null}
                on:click={() => invite()}
                type="submit">Invite</Button
            >
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={editing}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>{role.name}</Dialog.Title>
        </Dialog.Header>

        <Card.Root class="p-3 flex flex-row items-center gap-3">
            <DropdownMenu.Root bind:open={permExploring}>
                <DropdownMenu.Trigger asChild let:builder>
                    <Button
                        variant="secondary"
                        class="aspect-square"
                        size="icon"
                        builders={[builder]}
                    >
                        <ChevronDown />
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    <ScrollArea class="h-52">
                        {#if permissions.length == 0}
                            {#each Array(20) as _}
                                <Skeleton class="h-4 my-1" />
                            {/each}
                        {:else}
                            {#each permissions as permission}
                                <div class="my-1">
                                    <DropdownItem
                                        on:click={() =>
                                            (newPermText = permission)}
                                        >{permission}</DropdownItem
                                    >
                                </div>
                            {/each}
                        {/if}
                    </ScrollArea>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
            <Input bind:value={newPermText} placeholder="permission.node" />
            <ReadWrite bind:write={newPermWrite} />
            <Button
                on:click={() => pushPerm()}
                class="aspect-square"
                size="icon"
            >
                <Plus />
            </Button>
        </Card.Root>
        {#if updatedPermissions.length > 0}
            <ScrollArea class="max-h-52 h-full">
                <List>
                    {#each updatedPermissions as [node, acl]}
                        <Item slim>
                            <Button
                                on:click={() =>
                                    (updatedPermissions =
                                        updatedPermissions.filter(
                                            (p) => p[0] != node,
                                        ))}
                                size="icon"
                                variant="outline"
                                class="aspect-square rounded-full"
                            >
                                <X />
                            </Button>
                            <p class="grow">{node}</p>
                            <ReadWrite bind:write={acl} />
                        </Item>
                    {/each}
                </List>
            </ScrollArea>
        {:else}
            <Card.Root class="h-52 flex flex-col items-center justify-center">
                No permissions, yet
            </Card.Root>
        {/if}
        <Dialog.Footer>
            <Button
                disabled={loading}
                on:click={() => updateRole()}
                type="submit">Save changes</Button
            >
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={deleting}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
            <AlertDialog.Description>
                This action cannot be undone. This will permanently delete the
                role {role.name}
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action disabled={loading} on:click={() => remove()}
                >Continue</AlertDialog.Action
            >
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<Item>
    <p class="grow">
        {role.name}
    </p>
    <Button
        variant="secondary"
        class="rounded-full"
        size="sm"
        on:click={() => (editing = true)}
    >
        {role.permissions.length}
        permissions
    </Button>
    <div slot="dropdown">
        <DropdownItem on:click={() => (inviting = true)}>
            <Mail />
            Invite
        </DropdownItem>
        <DropdownItem on:click={() => (editing = true)}>
            <Pencil />
            Change Permissions
        </DropdownItem>
        <DropdownItem on:click={() => (deleting = true)} destructive>
            <Trash2 />
            Delete
        </DropdownItem>
    </div>
</Item>
