<script lang="ts">
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import * as Select from "$lib/components/ui/select/index.js";
    import type { Selected } from "bits-ui";
    import { Download } from "lucide-svelte";
    import { onMount } from "svelte";
    let games: string[] = [
        "minecraft",
        "7-days-to-die",
        "ark",
        "atlas",
        "cs-go",
        "fivem",
        "hurtworld",
        "rust",
        "space-engineers",
        "team-fortress-2",
        "unturned",
        "garrys-mod",
    ];
    let game: string | null;
    let selected: Selected<string> = {
        value: games[0],
        label: games[0],
    };
</script>

<div class="flex flex-col gap-3 w-full">
    <div class="flex flex-row items-center gap-2">
        <div class="w-10 text-center">
            <Badge>1</Badge>
        </div>
        <Select.Root bind:selected>
            <Select.Trigger>
                <Select.Value placeholder="Select a game" />
            </Select.Trigger>
            <Select.Content>
                <Select.Group>
                    <Select.Label>Games</Select.Label>
                    {#each games as game}
                        <Select.Item value={game} label={game}
                            >{game}</Select.Item
                        >
                    {/each}
                </Select.Group>
            </Select.Content>
            <Select.Input bind:value={game} />
        </Select.Root>
    </div>
    <div class="flex flex-row items-center gap-2">
        <div class="w-10 text-center">
            <Badge>2</Badge>
        </div>
        <Button class="grow" disabled={selected.value == null}>
            Download Addon <Download />
        </Button>
    </div>
    <div class="flex flex-row items-center gap-2">
        <div class="w-10 text-center">
            <Badge>3</Badge>
        </div>
        <Input readonly value="serverbench setup <key> [instance name]" />
    </div>
</div>
