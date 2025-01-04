<script lang="ts">
    import CardLines from "$lib/components/luxe/CardLines.svelte";
    import Logo from "$lib/components/sb/logo.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import User from "$lib/sb/User";
    import FileIconsMinecraft from "~icons/file-icons/minecraft";
    import SkillIconsDiscord from "~icons/skill-icons/discord";
    import GgGoogle from "~icons/gg/google";
    import MdiMicrosoft from '~icons/mdi/microsoft'
    import MdiGithub from '~icons/mdi/github'
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    let loading = false;

    async function login(service: string) {
        loading = true;
        try {
            await User.login(service);
            console.log("fully logged in");
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

<div class="flex flex-col gap-2">
    <Button
        disabled={loading}
        on:click={() => login("minecraft")}
        class="flex flex-row gap-3 items-center w-full"
    >
        <FileIconsMinecraft />Login With Minecraft
    </Button>
    <Button
        disabled={loading}
        on:click={() => login("google")}
        class="flex flex-row gap-3 items-center w-full"
    >
        <GgGoogle />Login With Google
    </Button>
    <Button
        disabled={loading}
        on:click={() => login("microsoft")}
        class="flex flex-row gap-3 items-center w-full"
    >
        <MdiMicrosoft />Login With Microsoft
    </Button>
    <Button
        disabled={loading}
        on:click={() => login("github")}
        class="flex flex-row gap-3 items-center w-full"
    >
        <MdiGithub />Login With GitHub
    </Button>
</div>

<span class="text-center text-xs opacity-80">
    By logging in, you accept our <a href="https://nominal.es/legal"
        >terms and conditions</a
    >
</span>
