<script lang="ts">
    import DropdownItem from "$lib/components/sb/section/list/DropdownItem.svelte";
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import {
        Eye,
        MoveDown,
        MoveUp,
        Pause,
        Signature,
        Trash2,
    } from "lucide-svelte";
</script>

<Item>
    <span class="grow"> <slot /> </span>
    <div slot="dropdown">
        <DropdownItem>
            <Pause />
            Pause Category
        </DropdownItem>
        <DropdownItem>
            <Signature class="min-h-4 min-w-4" />
            Upgradable/One Time/Unlimited
        </DropdownItem>
        <DropdownItem>
            <MoveUp />
            Move Up
        </DropdownItem>
        <DropdownItem>
            <MoveDown />
            Move Down
        </DropdownItem>
        <DropdownItem>
            <Eye />
            Make Visible
        </DropdownItem>
        <DropdownItem destructive>
            <Trash2 />
            Delete
        </DropdownItem>
    </div>
</Item>
