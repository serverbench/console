<script lang="ts">
    export let large=false
</script>
<div class="relative inline-flex overflow-hidden rounded-full p-px">
    <span
        class="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#c2c2c2_0%,#505050_50%,#bebebe_100%)]"
    />
    <span
        class:py-1={!large}
        class:px-4={!large}
        class:px-6={large}
        class:py-2={large}
        class:text-xs={!large}
        class="inline-flex h-full w-full items-center justify-center rounded-full bg-neutral-950 text-lg font-medium text-gray-50 backdrop-blur-3xl"
    >
        <slot />
    </span>
</div>
