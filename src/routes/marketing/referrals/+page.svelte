<script lang="ts">
    import Section from "$lib/components/sb/section/section.svelte";
    import ReferralProgram from "$lib/sb/referral/ReferralProgram";
    import { onMount } from "svelte";
    import ReferralProgramRow from "./ReferralProgramRow.svelte";
    import { Input } from "$lib/components/ui/input";
    import Button from "$lib/components/ui/button/button.svelte";

    let loading = false;
    let referralPrograms: ReferralProgram[] = [];
    let cut: number | null = null;

    let creating = false;

    onMount(async () => {
        loading = true;
        try {
            referralPrograms = await ReferralProgram.get();
        } catch (error) {}
        loading = false;
    });
</script>

<Section name="Referral Programs" list used={referralPrograms.length} {loading}>
    <div slot="add" class="flex flex-col gap-3">
        <Input
            bind:value={cut}
            type="number"
            min="0"
            max="100"
            placeholder="cut"
        />
        <Button
            disabled={creating}
            on:click={async () => {
                creating = true;
                try {
                    const program = await await ReferralProgram.create(
                        cut ?? 0,
                    );
                    referralPrograms = [...referralPrograms, program];
                    cut = null;
                } catch (error) {}
                creating = false;
            }}
        >
            Create Referral Program
        </Button>
    </div>
    {#each referralPrograms as program}
        <ReferralProgramRow {program} bind:list={referralPrograms} />
    {/each}
</Section>
