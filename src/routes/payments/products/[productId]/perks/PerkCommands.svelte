<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import type SkuPerkUsage from "$lib/sb/store/sku/perk/SkuPerkUsage";
    import { SquareChevronRight, Plus } from "lucide-svelte";
    import CommandVariable from "./CommandVariable.svelte";
    import Section from "$lib/components/sb/section/section.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import SimplePicker from "$lib/components/sb/picker/SimplePicker.svelte";
    import type { CommandTrigger } from "$lib/sb/store/sku/perk/PerkCmd";
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import CommandTriggerPicker from "$lib/components/sb/picker/CommandTriggerPicker.svelte";
    import PerkCommand from "./PerkCommand.svelte";

    export let perk: SkuPerkUsage;
    let addingCommands = false;
    let loading = false;

    let cmd: string | null = null;
    let trigger: CommandTrigger = "acquire";

    async function addCommand() {
        loading = true;
        try {
            await perk.perk.addCommand(trigger, cmd!);
            cmd = null;
            trigger = "acquire";
            perk = perk;
        } catch (error) {}
        loading = false;
    }
</script>

<Dialog.Root bind:open={addingCommands}>
    <Dialog.Trigger>
        <Tooltip.Root>
            <Tooltip.Trigger>
                <Button disabled={loading} variant="secondary" class="w-16">
                    {perk.perk.commands.length}
                    <SquareChevronRight />
                </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>perk commands</Tooltip.Content>
        </Tooltip.Root>
    </Dialog.Trigger>
    <Dialog.Content class="max-w-screen-md">
        <Dialog.Header>
            <Dialog.Title>'{perk.perk.name}' commands</Dialog.Title>
            <Dialog.Description>
                Remember that all the products sharing this perk will be
                affected.
                {#if perk.amount != null}
                    Since this perk is countable, you can use the variable <CommandVariable
                        example={String(perk.amount)}>amount</CommandVariable
                    >. If the product is within a tiered CategoryRow, you can
                    also use <CommandVariable
                        example={`${perk.amount}-'{amount_parent}, or 0'`}
                        >amount_diff</CommandVariable
                    > and <CommandVariable
                        example={`${perk.perk.name}'s {amount} on the cheaper product, or 0`}
                        >amount_parent</CommandVariable
                    >
                {/if}
            </Dialog.Description>
            <div class="py-5">
                <Section
                    name="cmds"
                    hideName
                    used={perk.perk.commands.length}
                    list
                    small
                >
                    <div slot="add" class="flex flex-row gap-1 items-center">
                        <div class="w-2/5">
                            <CommandTriggerPicker
                                disabled={loading}
                                bind:value={trigger}
                            />
                        </div>
                        <Input
                            disabled={loading}
                            bind:value={cmd}
                            class="grow"
                            placeholder="cmd"
                        />
                        <Button
                            disabled={loading}
                            on:click={() => addCommand()}
                        >
                            <Plus />
                        </Button>
                    </div>
                    {#each perk.perk.commands as cmd}
                        <PerkCommand bind:cmd bind:perk />
                    {/each}
                </Section>
            </div>
            <Dialog.Footer>
                <Button on:click={() => (addingCommands = false)} type="submit"
                    >Done</Button
                >
            </Dialog.Footer>
        </Dialog.Header>
    </Dialog.Content>
</Dialog.Root>
