<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import { Input } from "$lib/components/ui/input/index.js";
    import { ArrowRight } from "lucide-svelte";
    import * as Card from "$lib/components/ui/card/index.js";
    import Logo from "$lib/components/sb/logo.svelte";
    import FluentEmojiFlatEyes from "~icons/fluent-emoji-flat/eyes";
    import User from "$lib/sb/User";
    import Community from "$lib/sb/Community";
    import { goto } from "$app/navigation";

    let loading = false;
    let name: string = "";
    let slug: string = "";
    let manuallyUpdated = false;

    $: name,
        (() => {
            if (!manuallyUpdated) {
                slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
            }
        })();

    async function register() {
        loading = true;
        try {
            const community = await Community.create(name, slug);
            community.select();
        } catch (error) {}
        loading = false;
        goto("/");
    }
</script>

<Logo center />
<Card.Root class="p-5 text-sm">
    If you own a server, or want to start a new server, fill the details below!
    <FluentEmojiFlatEyes class="inline mb-1" />
</Card.Root>
<Input
    disabled={loading}
    bind:value={name}
    type="text"
    placeholder="Your Community Name"
/>
<div class="flex flex-row items-center gap-5">
    <Input
        disabled={loading}
        bind:value={slug}
        on:change={() => (manuallyUpdated = true)}
        type="text"
        placeholder="yourcommunityname"
    />
    <Input class="w-1/2 text-center" disabled value=".serverbench.io" />
</div>
<div class="flex flex-row justify-between items-center">
    <Button disabled={loading} variant="link"
        >I have been invited to a server</Button
    >
    <Button on:click={() => register()} disabled={loading}
        >Create Server <ArrowRight /></Button
    >
</div>
