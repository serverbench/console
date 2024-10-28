<script lang="ts">
    import Section from "$lib/components/sb/section/section.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import { Input } from "$lib/components/ui/input";
    import Role from "$lib/sb/staff/Role";
    import RoleC from "./Role.svelte";
    import { createEventDispatcher, onMount } from "svelte";

    const dispatch = createEventDispatcher();

    let roles: Role[] = [];
    let loading = true;
    let creating = false;
    let roleName: string | null = null;

    onMount(async () => {
        loading = true;
        try {
            roles = await Role.list();
        } catch (error) {}
        loading = false;
    });

    async function createRole() {
        creating = true;
        try {
            roles = [...roles, await Role.create(roleName!)];
            roleName = null;
        } catch (error) {}
        creating = false;
    }
</script>

<Section list {loading} used={roles.length} name="role" limit={3}>
    <div class="flex flex-row gap-3 items-center" slot="add">
        <div class="flex flex-col gap-1 grow">
            <Input
                disabled={creating}
                bind:value={roleName}
                placeholder="Role Name"
            />
        </div>
        <Button disabled={creating} on:click={() => createRole()}>Add</Button>
    </div>
    {#each roles as role}
        <RoleC
            on:updated={(r) => {
                const role = r.detail;
                for (let i = 0; i < roles.length; i++) {
                    const oldRole = roles[i];
                    if (oldRole.id == role.id) {
                        roles[i] = role;
                        roles = roles;
                        break;
                    }
                }
            }}
            on:invite={() => dispatch("invite")}
            on:delete={() => (roles = roles.filter((r) => r.id != role.id))}
            {role}
        />
    {/each}
</Section>
