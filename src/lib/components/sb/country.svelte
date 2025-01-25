<script lang="ts">
    import { Earth } from "lucide-svelte";
    import countryCode from "i18n-iso-countries";

    export let country: string | null,
        fullName: boolean = false,
        hideShortName: boolean = false;
</script>

<div class="flex flex-row gap-1 items-center">
    {#if country}
        <div class="py-[0.15rem]">
            <img
                class="h-3"
                src={`https://flagcdn.com/${country.toLowerCase()}.svg`}
                alt={`${country} flag`}
            />
        </div>
        <span>
            {#if fullName}
                {countryCode.getName(country, "en")}
            {:else if !hideShortName}
                {country}
            {/if}
        </span>
    {:else}
        <Earth />
        {#if fullName}
            worldwide
        {/if}
    {/if}
</div>
