<script lang="ts">
    import { Label } from "$lib/components/ui/label/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import Branding, { type BrandingImg } from "$lib/sb/branding/Branding";
    import { ImageOff, Loader2, Upload } from "lucide-svelte";
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import * as Avatar from "$lib/components/ui/avatar";
    import DropdownItem from "$lib/components/sb/section/list/DropdownItem.svelte";

    export let type: string;
    export let branding: Branding | null;

    let img: string | null = branding ? branding[type as BrandingImg] : null;
    let imgFile: File | null = null;
    export let loading = false;
    const reader = new FileReader();
    reader.onload = (e) => {
        img = reader.result?.toString() ?? null;
    };
    function handleFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target && target.files && target.files.length > 0) {
            // Use a local variable to store the first selected file
            const file = target.files[0];
            imgFile = file;

            // Read the file immediately to avoid reference loss
            reader.readAsDataURL(file);
        }
        updateImage().then(() => {});
    }
    async function updateImage() {
        loading = true;
        try {
            await Branding.updateImg(type as BrandingImg, imgFile!);
        } catch (error) {}
        loading = false;
    }
    async function deleteImage() {
        loading=true
        try {
            await Branding.removeImg(type as BrandingImg)
            img = null
        } catch (error) {
            
        }
        loading=false
    }
</script>

<Item>
    <Avatar.Root>
        <Avatar.Image src={img} />
        <Avatar.Fallback>
            {#if loading}
                <Loader2 class="animate-spin" />
            {:else}
                <ImageOff />
            {/if}
        </Avatar.Fallback>
    </Avatar.Root>
    <Label for="picture" class="capitalize">{type}</Label>
    <Input
        class="w-1/4 ml-auto"
        on:change={(event) => handleFileChange(event)}
        id="picture"
        type="file"
    />
    <div slot="dropdown">
        <DropdownItem on:click={() => deleteImage()} destructive>
            <ImageOff />
            Delete Image
        </DropdownItem>
    </div>
</Item>
