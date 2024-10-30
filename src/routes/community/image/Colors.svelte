<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import Branding, { type HSL } from "$lib/sb/branding/Branding";
    import { type HsvaColor } from "svelte-awesome-color-picker";
    import List from "$lib/components/sb/section/list/list.svelte";
    import ColorPicker from "./ColorPicker.svelte";

    export let branding: Branding | null;

    let primary: HsvaColor | undefined = toHSVA(branding?.primary ?? null);
    let secondary: HsvaColor | undefined = toHSVA(branding?.secondary ?? null);
    export let loading = false;

    function toHSVA(hsl: HSL | null) {
        if (hsl == null) return undefined;
        let h = hsl.h;
        let s = hsl.s;
        let l = hsl.l;
        let a = 1;
        // Normalize the lightness and saturation
        s /= 100;
        l /= 100;

        // Calculate the value (brightness) in HSV
        const v = l + s * Math.min(l, 1 - l);

        // Calculate the new saturation
        const sv = v === 0 ? 0 : 2 * (1 - l / v);

        // Convert to percentages
        return {
            h: h,
            s: Math.round(sv * 100),
            v: Math.round(v * 100),
            a: a,
        };
    }

    function toHSL(cc: HsvaColor | undefined) {
        if (cc == null) return null;
        let s = cc.s / 100;
        let v = cc.v / 100;
        var l = ((2 - s) * v) / 2;

        if (l != 0) {
            if (l == 1) {
                s = 0;
            } else if (l < 0.5) {
                s = (s * v) / (l * 2);
            } else {
                s = (s * v) / (2 - l * 2);
            }
        }
        return {
            h: cc.h,
            s: s * 100,
            l: l * 100,
        };
    }

    async function updateColors() {
        loading = true;
        try {
            await Branding.updateColors(toHSL(primary), toHSL(secondary));
        } catch (error) {}
        loading = false;
    }
</script>

<div class="flex flex-col gap-2">
    <List>
        <ColorPicker {loading} bind:color={primary} name="primary" />
        <ColorPicker {loading} bind:color={secondary} name="secondary" />
    </List>
    <div class="flex flex-row">
        <Button
            disabled={loading}
            class="ml-auto"
            on:click={() => updateColors()}>Update</Button
        >
    </div>
</div>
