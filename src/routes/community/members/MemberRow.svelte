<script lang="ts">
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import type Member from "$lib/sb/member/Member";
    import { createEventDispatcher } from "svelte";

    export let member: Member;
    const dispatch = createEventDispatcher();
</script>

<Item on:click={() => dispatch("click")}>
    <div class="flex flex-col gap-1">
        <p>{member.name}</p>
        <p class="text-xs">
            {member.eid}@{member.game.slug}
        </p>
    </div>
</Item>
