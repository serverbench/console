<script lang="ts">
    import type Currency from "$lib/sb/store/Currency";

    export let amount: number | null,
        currency: Currency | null,
        color: boolean = false;
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
        }).format(amount / 10 ** currency.digits);
    }

    function isPositive() {
        return amount != null && amount > 0;
    }

    function isNegative() {
        return amount != null && amount < 0;
    }
</script>

<span
    class="inline"
    class:dark:text-red-400={!isPositive() && isNegative() && color}
    class:dark:text-green-400={isPositive() && color}
    class:text-red-600={!isPositive() && isNegative() && color}
    class:text-green-600={isPositive() && color}
>
    {formattedAmount}
</span>
