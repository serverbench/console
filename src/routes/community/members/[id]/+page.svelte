<script lang="ts">
    import { page } from "$app/stores";
    import type { InstanceCount } from "$lib/sb/member/Connection";
    import Member, { type ChatMessageFilter } from "$lib/sb/member/Member";
    import { onMount } from "svelte";
    import MemberMessages from "./messages/MemberMessages.svelte";
    import * as Avatar from "$lib/components/ui/avatar";
    import { Activity, History, Loader2 } from "lucide-svelte";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import MemberDetails from "./MemberDetails.svelte";

    let member: Member | null = null;

    onMount(async () => {
        await load();
    });

    async function load() {
        const id = $page.params.id;
        member = await Member.fromId(id);
    }

    $: $page.params.id, load();
</script>

<Breadcrumb.Root>
    <Breadcrumb.List>
        <Breadcrumb.Item>
            <Breadcrumb.Link href="/community/members">members</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        {#if member}
            <Breadcrumb.Item>
                <Breadcrumb.Page>
                    {member.name}
                </Breadcrumb.Page>
            </Breadcrumb.Item>
        {:else}
            <Breadcrumb.Item>
                <Breadcrumb.Page>
                    <Loader2 class="animate-spin" />
                </Breadcrumb.Page>
            </Breadcrumb.Item>
        {/if}
    </Breadcrumb.List>
</Breadcrumb.Root>
<MemberDetails {member} />
