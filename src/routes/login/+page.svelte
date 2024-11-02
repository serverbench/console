<script lang="ts">
    import CardLines from "$lib/components/luxe/CardLines.svelte";
    import Logo from "$lib/components/sb/logo.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import User from "$lib/sb/User";
    import FileIconsMinecraft from "~icons/file-icons/minecraft";
    import SkillIconsDiscord from "~icons/skill-icons/discord";

    let loading = false;

    async function login(service: string) {
        loading = true;
        try {
            await User.login(service);
        } catch (error) {
            loading = false;
        }
    }
</script>

<Logo center big />
<CardLines>
    serverbench is still in beta. we are making steady progress to become the
    ultimate way to manage your game server communities. <a
        class="underline"
        href="https://nominal.es/discord">click here</a
    >
    to join us on Discord <SkillIconsDiscord class="inline" />
</CardLines>

<Button
    disabled={loading}
    on:click={() => login("minecraft")}
    class="flex flex-row gap-3 items-center w-full"
>
    <FileIconsMinecraft />Login With Minecraft
</Button>

<span class="text-center text-xs opacity-80">
    By logging in, you accept our <a href="https://nominal.es/legal"
        >terms and conditions</a
    >
</span>
