<div class="w-full rounded-3xl">
    <div
        class="group relative grid overflow-hidden px-4 py-5 shadow-[0_1000px_0_0_hsl(0_0%_20%)_inset] transition-colors duration-200 rounded-3xl"
    >
        <span>
            <span
                class="spark mask-gradient animate-flip before:animate-kitrotate absolute inset-0 h-[100%] w-[100%] overflow-hidden [mask:linear-gradient(white,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:rotate-[-90deg] before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]  rounded-3xl"
            />
        </span>
        <span
            class="backdrop absolute inset-px bg-neutral-950 transition-colors duration-200  rounded-3xl"
        />
        <div class="space-y-2 z-10  rounded-3xl">
            <p class="text-sm leading-[1.5] text-neutral-200">
                <slot />
            </p>
        </div>
    </div>
</div>
