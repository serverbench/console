<script lang="ts">
    import * as Table from "$lib/components/ui/table";
    import * as Card from "$lib/components/ui/card";

    export let hideBorder = false,
        hideTopBorder = false;
</script>

<Card.Root
    class={`overflow-hidden ${hideBorder ? `border-0 ${hideTopBorder ? '' : 'border-t-[1px]'} rounded-none` : ""}`}
>
    <Table.Root class={hideBorder ? "border-0 rounded-none" : ""}>
        <Table.Body class={hideBorder ? "border-0 rounded-none" : ""}>
            <slot />
        </Table.Body>
    </Table.Root>
</Card.Root>
