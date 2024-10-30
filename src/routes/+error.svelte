<script lang="ts">
    import FluentEmojiPizza from "~icons/fluent-emoji/pizza";
    import FluentEmojiMonkey from "~icons/fluent-emoji/monkey";
    import * as Avatar from "$lib/components/ui/avatar";
</script>

<div></div>
<div
    class="flex flex-col gap-3 items-center justify-center w-full mx-auto max-w-xl text-center"
>
    <div class="flex flex-row gap-5 items-center">
        <div class="animate-bounce" style="rotate: -30deg;">
            <FluentEmojiPizza class="w-10 h-10" style="rotate: 20deg" />
        </div>
        <FluentEmojiMonkey
            class="w-10 h-10 animate-bounce"
            style="animation-delay: 500ms; rotate: 30deg;"
        />
    </div>
    <h1 class="capitalize text-xl">I'm working on it!</h1>
    <p>
        I'm a one-person team and I'm working on this project in my free time.
        I'm sorry for the inconvenience. I'll try to fix this as soon as
        possible. Thank you for your patience. Please, consider supporting the
        project by buying me a pizza! 🍕
    </p>
    <a class="hover:animate-spin" target="_blank" href="https://osuna.dev">
        <Avatar.Root>
            <Avatar.Image src="https://cdn.serverbench.io/me.png" />
        </Avatar.Root>
    </a>
    <a href="https://www.buymeacoffee.com/happy" target="_blank">
        <button
            class="group relative grid overflow-hidden rounded-xl px-4 py-2 shadow-[0_1000px_0_0_hsl(0_0%_20%)_inset] transition-colors duration-200"
        >
            <span>
                <span
                    class="spark mask-gradient animate-flip before:animate-kitrotate absolute inset-0 h-[100%] w-[100%] overflow-hidden rounded-xl [mask:linear-gradient(white,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:rotate-[-90deg] before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]"
                />
            </span>
            <span
                class="backdrop absolute inset-px rounded-[11px] bg-neutral-950 transition-colors duration-200 group-hover:bg-neutral-900"
            />
            <span class="z-10 text-neutral-400 text-sm font-medium p-1">
                Buy me a pizza! 🍕
            </span>
        </button>
    </a>
</div>
