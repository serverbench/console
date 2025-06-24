<script lang="ts">
    import ServerCreate from "$lib/components/sb/server/ServerCreate.svelte";
    import ServerRow from "$lib/components/sb/server/ServerRow.svelte";
    import Server from "$lib/sb/server/Server";
    import { onMount } from "svelte";
    import Section from "$lib/components/sb/section/section.svelte";
    import Keys from "./keys/Keys.svelte";

    let servers: Server[] = [];
    let lastCreated: Server | null = null;
    let loading = true;

    async function reloadServers() {
        loading = true;
        try {
            servers = await Server.list();
        } catch (error) {}
        loading = false;
    }

    onMount(async () => {
        await reloadServers();
    });

    function handleServerAdd(server: CustomEvent<Server>) {
        lastCreated = server.detail;
        console.log(server.detail)
        servers = [...servers, server.detail];
    }

    function handleServerRemove(server: Server) {
        servers = servers.filter((s) => s.id != server.id);
    }
</script>

<Section list {loading} used={servers.length} limit={10} name="servers">
    <div slot="add">
        <ServerCreate on:create={handleServerAdd} />
    </div>
    {#each servers as server}
        <ServerRow
            hosting={lastCreated != null && lastCreated.id == server.id}
            on:removed={() => handleServerRemove(server)}
            {server}
        />
    {/each}
</Section>
<Keys />
