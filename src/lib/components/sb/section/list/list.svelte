<script lang="ts">
    import * as Table from "$lib/components/ui/table";
    import * as Card from "$lib/components/ui/card";
</script>

<Card.Root class="overflow-hidden">
    <Table.Root>
        <Table.Body>
            <slot />
        </Table.Body>
    </Table.Root>
</Card.Root>
