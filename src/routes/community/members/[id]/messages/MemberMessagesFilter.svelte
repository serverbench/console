<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import Switch from "$lib/components/ui/switch/switch.svelte";
    import { Filter } from "lucide-svelte";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import type { ChatMessageFilter } from "$lib/sb/member/Member";
    import SimplePicker from "$lib/components/sb/picker/SimplePicker.svelte";

    let minimumToxicity: number = 0;
    let toxicityFrequency: number = 0;
    let ignoreProfanity: boolean = false;
    let aiFlagged: boolean = false;

    export let filters: ChatMessageFilter;

    $: minimumToxicity,
        toxicityFrequency,
        ignoreProfanity,
        aiFlagged,
        (filters = {
            minToxicity: Number(minimumToxicity) || undefined,
            minToxicityAverage:
                Number(
                    Math.trunc(
                        toxicityFrequency * Number(minimumToxicity),
                    ),
                ) || undefined,
            minToxicityProfanity:
                Number(!ignoreProfanity ? minimumToxicity : undefined) ||
                undefined,
            minToxicityAverageProfanity:
                Number(
                    !ignoreProfanity
                        ? Math.trunc(
                              toxicityFrequency *
                                  Number(minimumToxicity),
                          )
                        : undefined,
                ) || undefined,
            tagged: aiFlagged ? true : undefined,
        });
</script>

<Popover.Root>
    <Popover.Trigger>
        <Button size="icon" variant="secondary">
            <Filter />
        </Button>
    </Popover.Trigger>
    <Popover.Content>
        <div class="grid grid-cols-2 gap-2 items-center">
            <Switch bind:checked={aiFlagged} />
            <span> AI-Analysis Flag </span>
            <Switch bind:checked={ignoreProfanity} />
            <span> Ignore Profanity </span>
            <SimplePicker
                bind:value={minimumToxicity}
                name="Toxicity Level"
                items={[
                    [0, "Any"],
                    [30, "Low"],
                    [60, "Medium"],
                    [75, "High"],
                    [80, "Very High"],
                ]}
            />
            <span> Minimum Toxicity </span>
            <SimplePicker
                disabled={!minimumToxicity || minimumToxicity <= 0}
                bind:value={toxicityFrequency}
                name="Toxicity Frequency"
                items={[
                    [0, "Any"],
                    [0.25, "Low"],
                    [0.5, "Medium"],
                    [0.75, "High"],
                    [1, "Very High"],
                ]}
            />
            <span> Toxicity Frequency </span>
        </div>
    </Popover.Content>
</Popover.Root>
