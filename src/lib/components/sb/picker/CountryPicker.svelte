<script lang="ts">
    import SimplePicker from "./SimplePicker.svelte";
    import countryCodes from "i18n-iso-countries";
    import countriesEn from "i18n-iso-countries/langs/en.json";
    countryCodes.registerLocale(countriesEn);
    export let disabled = false,
        value: string | null = null,
        optional: boolean;
</script>

<SimplePicker
    items={Object.keys(countryCodes.getAlpha2Codes()).map((c) => [
        c,
        countryCodes.getName(c, "en") ?? c,
    ])}
    name="Country"
    {disabled}
    optional={optional ? "Global" : null}
    bind:value
/>
