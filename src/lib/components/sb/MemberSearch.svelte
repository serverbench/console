<script lang="ts">
    import Calculator from "lucide-svelte/icons/calculator";
    import Calendar from "lucide-svelte/icons/calendar";
    import CreditCard from "lucide-svelte/icons/credit-card";
    import Settings from "lucide-svelte/icons/settings";
    import Smile from "lucide-svelte/icons/smile";
    import User from "lucide-svelte/icons/user";
    import { onMount } from "svelte";
    import * as Command from "$lib/components/ui/command/index.js";
    import Button from "../ui/button/button.svelte";
    import { Loader } from "svelte-sonner";
    import { Loader2 } from "lucide-svelte";
    import Member from "$lib/sb/member/Member";
    import { goto } from "$app/navigation";

    let open = false;
    let search: string = "";
    let results: Member[] | null = [];

    onMount(() => {
        function handleKeydown(e: KeyboardEvent) {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                open = !open;
            }
        }

        document.addEventListener("keydown", handleKeydown);
        return () => {
            document.removeEventListener("keydown", handleKeydown);
        };
    });

    async function handleSearch() {
        const og = search.trim();
        if (og === "") {
            results = [];
            return;
        }
        setTimeout(async () => {
            if (og != search.trim()) {
                return;
            }
            results = null; // Show loading state
            try {
                results = [await Member.search(og)];
            } catch (error) {
                results = [];
            }
        }, 1000);
    }

    $: search, handleSearch();
</script>

<div>
    <Button on:click={() => (open = true)} variant="secondary">
        <p class="text-muted-foreground text-sm">
            <span class="mr-10"> Search </span>
            <kbd
                class="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100"
            >
                <span class="text-xs">⌘</span>K
            </kbd>
        </p>
    </Button>
    <Command.Dialog bind:open>
        <Command.Input
            bind:value={search}
            placeholder="Type a command or search..."
        />
        <Command.List>
            {#if results != null && results.length > 0}
                <Command.Group heading="Members">
                    {#each results as member}
                        <Command.Item
                            onSelect={() => {
                                open = false;
                                goto(`/community/members/${member.id}`);
                            }}
                        >
                            <span>{member.name}</span>
                        </Command.Item>
                    {/each}
                </Command.Group>
            {:else if results != null}
                <Command.Empty>No results found.</Command.Empty>
            {:else}
                <Command.Loading>
                    <Loader2 class="animate-spin my-5 mx-auto" />
                </Command.Loading>
            {/if}
        </Command.List>
    </Command.Dialog>
</div>
