<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import Member from "$lib/sb/member/Member";
    import SkuOwnership from "$lib/sb/store/SkuOwnership";
    import { Loader2 } from "lucide-svelte";

    let file: File;
    let loading = false;

    async function upload() {
        loading = true;
        try {
            console.log(file);
            await Member.import(file);
        } catch (error) {
            console.error("Error uploading file:", error);
        }
        loading = false;
    }

    function handleFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            file = target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                console.log(reader.result);
            };
            reader.readAsText(file);
        }
    }
</script>

<div class="grid w-full max-w-sm items-center gap-1.5">
    <Label for="csv">Import Members (CSV)</Label>
    <Input
        on:change={(event) => handleFileChange(event)}
        id="csv"
        type="file"
    />
</div>
<Button on:click={() => upload()} disabled={loading}>
    {#if loading}
        <Loader2 class="animate-spin" />
    {:else}
        Upload
    {/if}
</Button>
