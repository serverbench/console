<script lang="ts">
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import List from "$lib/components/sb/section/list/list.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import SiteTimings from "./SiteTimings.svelte";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import Label from "$lib/components/ui/label/label.svelte";

    export let resetScheme: "cooldown" | "fixed" = "cooldown";
    export let cooldown = 0;
    export let reset = 0;
    export let timezone: string | null = null;
    export let creating = false;
    export let domain: string | null = null;
    export let protocols: Record<string, string | null> = {};

    export let hideDomain: boolean = false;

    let checkmarks: Record<string, boolean> = {};
</script>

{#if !hideDomain}
    <Input bind:value={domain} placeholder="Voting Site Domain" />
{/if}
<List>
    {#each ["NuVotifier"] as protocol}
        <Item>
            <div class="w-full flex flex-row gap-3 items-center">
                <Checkbox disabled checked={checkmarks[protocol]} />
                <Label>
                    {protocol}
                </Label>
            </div>
            <Input
                class="w-full"
                disabled={creating}
                bind:value={protocols[protocol]}
                on:keyup={() => {
                    checkmarks[protocol] =
                        protocols[protocol] != null &&
                        protocols[protocol].length > 0;
                    checkmarks = checkmarks;
                    protocols = protocols;
                }}
                placeholder={`${protocol} service name`}
            />
        </Item>
    {/each}
</List>
<SiteTimings
    disabled={creating}
    bind:resetScheme
    bind:cooldown
    bind:reset
    bind:timezone
/>
