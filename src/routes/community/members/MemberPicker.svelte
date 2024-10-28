<script lang="ts">
    import List from "$lib/components/sb/section/list/list.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Member from "$lib/sb/member/Member";
    import { Loader2, CircleUser } from "lucide-svelte";
    import MemberRow from "./MemberRow.svelte";
    import { createEventDispatcher, onMount } from "svelte";
    import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import Item from "$lib/components/sb/section/list/Item.svelte";

    let username: string | null = null;
    let members: Member[] = [];
    let filterMember: Member | null = null;
    let loading = false;
    let lastUpdated: number | null = null;
    let page = 0;

    async function loadMembers() {
        if (loading) return;
        loading = true;
        try {
            members = await Member.list(page);
            page++;
        } catch (error) {}
        loading = false;
    }

    onMount(async () => {
        await loadMembers();
    });

    $: username,
        (() => {
            lastUpdated = new Date().getTime();
            setTimeout(async () => {
                if (new Date().getTime() - lastUpdated! >= 1000) {
                    loading = true;
                    try {
                        filterMember = await Member.search(username!);
                    } catch (error) {
                        filterMember = null;
                    }
                    loading = false;
                }
            }, 1000);
        })();

    export let member: Member | null = null;

    function selectMember(m: Member | null) {
        if (m == null) return;
        member = m;
        open = false;
    }

    export let open: boolean = false;
</script>

<Popover.Root bind:open>
    <Popover.Trigger asChild let:builder>
        <Button class="w-full" variant="secondary" builders={[builder]}>
            {#if member}
                <div
                    class="aspect-square w-6 h-6 flex flex-col items-center justify-center bg-primary rounded-full"
                >
                    {member.name[0].toUpperCase()}
                </div>
                {member.name}
            {:else}
                <CircleUser />
                Select Member
            {/if}
        </Button>
    </Popover.Trigger>
    <Popover.Content class="w-80 flex flex-col gap-2">
        <Input bind:value={username} placeholder="username" />
        <List>
            <ScrollArea class="max-h-52">
                {#if username && username.length > 0}
                    {#if filterMember != null}
                        <MemberRow
                            on:click={() => selectMember(filterMember)}
                            member={filterMember}
                        />
                    {:else}
                        <Item>Unknown Member</Item>
                    {/if}
                {:else}
                    {#each members as member}
                        <MemberRow
                            on:click={() => selectMember(member)}
                            {member}
                        />
                    {/each}
                {/if}
                {#if loading}
                    <Loader2 class="mx-auto animate-spin" />
                {/if}
            </ScrollArea>
        </List>
    </Popover.Content>
</Popover.Root>
