<script lang="ts">
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
<div class="w-full">
    <div
        class="group relative grid overflow-hidden rounded-xl px-4 py-5 shadow-[0_1000px_0_0_hsl(0_0%_20%)_inset] transition-colors duration-200"
    >
        <span>
            <span
                class="spark mask-gradient animate-flip before:animate-kitrotate absolute inset-0 h-[100%] w-[100%] overflow-hidden rounded-xl [mask:linear-gradient(white,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:rotate-[-90deg] before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]"
            />
        </span>
        <span
            class="backdrop absolute inset-px rounded-[11px] bg-neutral-950 transition-colors duration-200"
        />
        <div class="space-y-2 z-10">
            <p class="text-sm leading-[1.5] text-neutral-200">
                serverbench is still in beta. we are making steady progress to
                become the ultimate way to manage your game server communities. <a
                    class="underline"
                    href="https://nominal.es/discord">click here</a
                >
                to join us on Discord <SkillIconsDiscord class="inline" />
            </p>
        </div>
    </div>
</div>

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
