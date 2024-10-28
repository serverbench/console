<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import Branding from "$lib/sb/branding/Branding";
    import ColorPicker, { type HsvaColor } from "svelte-awesome-color-picker";
    import * as Card from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { onMount } from "svelte";

    let primary: HsvaColor;
    let secondary: HsvaColor;
    let loading = false;
    let branding: Branding | null = null;
    let isoImg: string | null = null;
    let isoFile: File | null = null;
    const reader = new FileReader();
    reader.onload = (e) => {
        isoImg = reader.result?.toString() ?? null;
    };

    onMount(async () => {
        loading = true;
        try {
            branding = await Branding.get();
            isoImg = branding?.iso ?? null;
        } catch (error) {}
        loading = false;
    });

    // Change handler for file input
    // Correctly handle the file input change
    function handleFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target && target.files && target.files.length > 0) {
            // Use a local variable to store the first selected file
            const file = target.files[0];
            isoFile = file;

            // Read the file immediately to avoid reference loss
            reader.readAsDataURL(file);
        }
    }

    function toHSL(cc: HsvaColor) {
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

    async function updateImage() {
        loading = true;
        try {
            await Branding.updateIso(isoFile!);
        } catch (error) {}
        loading = false;
    }
</script>

<Card.Root class="p-3">
    <div class="flex flex-col gap-3 grow">
        <div class="flex flex-col">
            <Label>Primary Color</Label>
            <ColorPicker bind:hsv={primary} position="responsive" />
        </div>
        <hr />
        <div class="flex flex-col">
            <Label>Secondary Color</Label>
            <ColorPicker bind:hsv={secondary} position="responsive" />
        </div>
    </div>
</Card.Root>
<div class="flex flex-row">
    <Button disabled={loading} class="ml-auto" on:click={() => updateColors()}
        >Update</Button
    >
</div>
<Card.Root class="flex flex-row gap-3 p-3">
    <Card.Root class="w-24 h-24 relative overflow-hidden">
        <img class="absolute w-full" src={isoImg} alt="" />
    </Card.Root>
    <div class="flex flex-col grow">
        <Label for="picture">Picture</Label>
        <Input
            class="w-full"
            on:change={(event) => handleFileChange(event)}
            id="picture"
            type="file"
        />
    </div>
</Card.Root>
<div class="flex flex-row">
    <Button disabled={loading} class="ml-auto" on:click={() => updateImage()}
        >Update</Button
    >
</div>
