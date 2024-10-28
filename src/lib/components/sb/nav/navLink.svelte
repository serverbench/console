<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    export let href: string;
    import { page } from "$app/stores";
</script>

<Button
    {href}
    class={`flex flex-row gap-2 justify-start text-sm ${$page.url.pathname == href ? "font-black" : "font-light"}`}
    size="sm"
    variant="ghost"
>
    <slot />
</Button>
