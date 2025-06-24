<script lang="ts">
    import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import type Container from "$lib/sb/machine/Container";
    import { Copy, CopyCheck, KeyRound, Loader2 } from "lucide-svelte";
    let password: string | null = null;
    export let container: Container;
    let copied = false;
    async function resetPassword() {
        if (password != null) {
            return;
        }
        await container.password(
            (p) => {
                password = p;
            },
            () => {},
        );
    }
</script>

<Dialog.Root>
    <Dialog.Trigger>
        <Button variant="secondary" on:click={() => resetPassword()}
            >Reset Password <KeyRound /></Button
        >
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Reset Password</Dialog.Title>
        </Dialog.Header>
        <div class="flex flex-row gap-2 items-center">
            <Input
                id="password"
                type="password"
                disabled={password == null}
                readonly
                value={password}
            />
            <Button
                size="icon"
                disabled={password == null}
                on:click={() => {
                    navigator.clipboard.writeText(`${password ?? "?"}`);
                    copied = true;
                    setTimeout(() => {
                        copied = false;
                    }, 1000);
                }}
            >
                {#if password == null}
                    <Loader2 class="animate-spin" />
                {:else if !copied}
                    <Copy />
                {:else}
                    <CopyCheck />
                {/if}
            </Button>
        </div>
    </Dialog.Content>
</Dialog.Root>
