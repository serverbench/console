<script lang="ts">
    import SimplePicker from "./SimplePicker.svelte";
    import { data } from "currency-codes";
    import countryCodes from "i18n-iso-countries";
    import countriesEn from "i18n-iso-countries/langs/en.json";
    countryCodes.registerLocale(countriesEn);
    export let disabled = false,
        value: string | null = null;
</script>

<SimplePicker
    items={data.map((d) => [d.code, `${d.code} (${d.currency})`])}
    name="Currency"
    {disabled}
    bind:value
/>
