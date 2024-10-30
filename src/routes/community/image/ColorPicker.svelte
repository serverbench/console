<script lang="ts">
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import type { HsvaColor } from "svelte-awesome-color-picker";
    import ColorPicker from "svelte-awesome-color-picker";
    import * as Avatar from "$lib/components/ui/avatar";
    import { Loader2, Slash } from "lucide-svelte";
    import type Branding from "$lib/sb/branding/Branding";

    export let loading: boolean;
    export let color: HsvaColor | undefined;
    let hexPreview: string | undefined = color
        ? hsvaToHex(color?.h, color?.s, color?.v, color?.a)
        : undefined;
    let open = false;
    export let name: string;

    function hsvaToHex(
        h: number = 0,
        s: number = 0,
        v: number = 0,
        a: number = 0,
    ) {
        s /= 100;
        v /= 100;

        let c = v * s;
        let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        let m = v - c;

        let r, g, b;
        if (0 <= h && h < 60) {
            r = c;
            g = x;
            b = 0;
        } else if (60 <= h && h < 120) {
            r = x;
            g = c;
            b = 0;
        } else if (120 <= h && h < 180) {
            r = 0;
            g = c;
            b = x;
        } else if (180 <= h && h < 240) {
            r = 0;
            g = x;
            b = c;
        } else if (240 <= h && h < 300) {
            r = x;
            g = 0;
            b = c;
        } else {
            r = c;
            g = 0;
            b = x;
        }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        a = Math.round(a * 255);

        return (
            "#" +
            r.toString(16).padStart(2, "0") +
            g.toString(16).padStart(2, "0") +
            b.toString(16).padStart(2, "0") +
            a.toString(16).padStart(2, "0")
        );
    }
</script>

<Item on:click={() => (open = true)}>
    <div
        class="fixed z-50 dark:text-black transition-opacity"
        class:opacity-0={!open}
    >
        <ColorPicker
            nullable={true}
            bind:isOpen={open}
            label=""
            isAlpha={false}
            bind:hex={hexPreview}
            bind:hsv={color}
            position="responsive"
        />
    </div>

    <Avatar.Root>
        <Avatar.Fallback>
            {#if !loading}
                {#if hexPreview}
                    <div
                        style={hexPreview
                            ? `background-color:${hexPreview}`
                            : undefined}
                        class="rounded-full w-10 h-10 bg-red-50"
                    />
                {:else}
                    <Slash />
                {/if}
            {:else}
                <Loader2 class="animate-spin" />
            {/if}
        </Avatar.Fallback>
    </Avatar.Root>
    <div class=" overflow-visible"></div>
    <Label class="capitalize">{name} Color</Label>
</Item>
