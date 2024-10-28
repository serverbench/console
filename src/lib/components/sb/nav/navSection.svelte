<script lang="ts">
    import type { Icon } from "lucide-svelte";
    import type { ComponentType } from "svelte";

    export let name: string, icon: ComponentType<Icon>;
</script>

<div>
    <div class="flex flex-row gap-2 items-center">
        <svelte:component this={icon} />
        <p class="text-sm capitalize dark:text-neutral-300">
            {name}
        </p>
    </div>
    <div class="flex flex-row gap-2 py-2">
        <div class="flex flex-col items-center pl-2">
            <div class="grow border-l my-2" />
        </div>
        <div class="flex flex-col gap-1 grow">
            <slot />
        </div>
    </div>
</div>
