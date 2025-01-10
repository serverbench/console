<script lang="ts">
    import type Currency from "$lib/sb/store/Currency";


    export let amount: number, currency: Currency;
    const formattedAmount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.code,
    }).format(amount / (10 ** currency.digits));
</script>

<span>
    {formattedAmount}
</span>
