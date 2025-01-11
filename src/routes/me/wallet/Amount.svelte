<script lang="ts">
    import type Currency from "$lib/sb/store/Currency";

    export let amount: number | null, currency: Currency | null;
    let formattedAmount = "";
    formatAmount(amount, currency);

    $: amount, currency, formatAmount(amount, currency);
    function formatAmount(amount: number | null, currency: Currency | null) {
        if (amount == null || currency == null) {
            return;
        }
        formattedAmount = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency.code,
        }).format(amount / (10 ** currency.digits));
    }
</script>

<span class="inline">
    {formattedAmount}
</span>
