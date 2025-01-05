<script lang="ts">
    import RotateShine from "$lib/components/luxe/RotateShine.svelte";
    import { page } from "$app/stores";
    import { Copy, CopyCheck, Link2, Loader2 } from "lucide-svelte";
    import { onMount } from "svelte";
    import ReferralProgram from "$lib/sb/referral/ReferralProgram";
    import CardLines from "$lib/components/luxe/CardLines.svelte";
    import Card from "$lib/components/ui/card/card.svelte";
    import Branding from "$lib/sb/branding/Branding";
    import Button from "$lib/components/ui/button/button.svelte";
    import ReferralProgramRow from "../../marketing/referrals/ReferralProgramRow.svelte";
    import ReferralCode from "$lib/sb/referral/ReferralCode";
    import { Confetti } from "svelte-confetti";
    import SimplePicker from "$lib/components/sb/picker/SimplePicker.svelte";
    import Empty from "$lib/components/sb/section/empty.svelte";
    import Input from "$lib/components/ui/input/input.svelte";

    import LogosTiktokIcon from "~icons/logos/tiktok-icon";
    import LogosYoutubeIcon from "~icons/logos/youtube-icon";
    import SkillIconsInstagram from "~icons/skill-icons/instagram";
    import LogosRedditIcon from "~icons/logos/reddit-icon";
    import FluentEmojiFlatMoneyWithWings from "~icons/fluent-emoji-flat/money-with-wings";
    import Section from "$lib/components/sb/section/section.svelte";
    import ReferredList from "./ReferredList.svelte";

    let codes: ReferralCode[] = [];
    let code: ReferralCode | null = null;
    let program: ReferralProgram | null = null;
    let joining = false;
    let joined = false;
    let logo: string | null = null;
    let loading = false;
    let error = false;
    let copied = false;

    let i = 0;

    onMount(async () => {
        setInterval(() => {
            i++;
            if (i > 3) i = 0;
        }, 5000);
        loading = true;
        codes = await ReferralCode.get();
        code = codes[0] ?? null;
        if ($page.url.searchParams.has("join")) {
            try {
                const communityId = $page.url.searchParams.get("community");
                const programId = $page.url.searchParams.get("program");
                const providedProgram = await ReferralProgram.preview(
                    communityId!,
                    programId!,
                );
                if (!codes.find((c) => c.program.id == providedProgram.id)) {
                    joining = true;
                    program = providedProgram;
                    try {
                        logo = (await Branding.preview(program.community)).iso;
                    } catch (error) {}
                }
            } catch (e) {
                error = true;
            }
        }
        loading = false;
    });

    async function joinProgram() {
        loading = true;
        try {
            codes = [
                await ReferralCode.joinProgram(
                    program!.community.id,
                    program!.id,
                ),
                ...codes,
            ];
            code = codes[0];
            joining = false;
            joined = true;
        } catch (err) {
            error = true;
        }
        loading = false;
    }
</script>

{#if joining}
    {#if program == null}
        <Loader2 class="animate-spin mx-auto" />
    {:else}
        <Card class="py-16 px-4">
            <div class="flex flex-col gap-3 justify-center items-center">
                {#if logo}
                    <img src={logo} class="w-14" alt="" />
                {/if}
                <p class="text-2xl">
                    Join {program.community.name} And Get
                </p>
                <RotateShine large>
                    {program.cut}%
                </RotateShine>
                <p class="text-lg">
                    Of the sales from new members joining with your code
                </p>
            </div>
            <div class="flex flex-row items-center justify-center mt-5">
                <Button
                    disabled={loading}
                    on:click={() => joinProgram()}
                    size="lg"
                >
                    Join Now
                    {#if loading}
                        <Loader2 class="animate-spin" />
                    {/if}
                </Button>
            </div>
        </Card>
    {/if}
{:else if joined && program}
    <CardLines>
        <span class="text-center">
            You've joined the {program.community.name} referral program.
        </span>
        <div class="flex-row items-center justify-center flex absolute w-full">
            <Confetti amount={100} x={[-2, 2]} />
        </div>
    </CardLines>
{/if}
{#if codes.length > 0 || loading}
    {#key codes}
        <SimplePicker
            value={code}
            disabled={loading}
            name="referral program"
            items={codes.map((c) => [c, c.program.community.name])}
        />
    {/key}
    {#if code}
        <Card class="p-10 leading-relaxed flex flex-col gap-3">
            <div>
                You are earning <span class="mx-1"
                    ><RotateShine>{code.program.cut}%</RotateShine></span
                >
                in sales from members joining with your code. To start earning, share
                your unique join address:
            </div>
            <div class="flex flex-row gap-3">
                <Input
                    class="text-center text-lg"
                    value={code.program.community.name == "PureVanilla"
                        ? `${code.code}.purevanilla.co`
                        : code.code}
                    readonly
                />
                <Button
                    on:click={() => {
                        navigator.clipboard.writeText(
                            `${code?.code ?? "?"}.purevanilla.co`,
                        );
                        copied = true;
                        setTimeout(() => {
                            copied = false;
                        }, 1000);
                    }}
                >
                    {#if copied}
                        <CopyCheck />
                    {:else}
                        <Copy />
                    {/if}
                </Button>
            </div>
            <div class="flex flex-col gap-5 my-5">
                <div class="flex flex-row gap-3 items-center">
                    <Button>1</Button>
                    <span>
                        Share that address with <u>new members</u>.
                    </span>
                </div>
                <div class="flex flex-row gap-3 items-center">
                    <Button>2</Button>
                    <span>
                        When those new members buy something, you'll get a {code
                            .program.cut}% cut on the net amount.
                    </span>
                </div>
                <div class="flex flex-row gap-3 items-center">
                    <Button>3</Button>
                    <span>
                        Your balance will be available on
                        <a
                            class="underline inline-flex flex-row gap-2 items-center"
                            href="/me/wallet">wallet <Link2 /></a
                        >.
                    </span>
                </div>
                <hr />
                <div class="grid md:grid-cols-2 gap-5">
                    <Card
                        class="p-10 text-center flex flex-col items-center gap-3"
                    >
                        {#if i == 0}
                            <LogosTiktokIcon class="h-20 w-20" />
                            TikTok
                        {:else if i == 1}
                            <LogosYoutubeIcon class="h-20 w-20" />
                            YouTube
                        {:else if i == 2}
                            <SkillIconsInstagram class="h-20 w-20" />
                            Instagram
                        {:else if i == 3}
                            <LogosRedditIcon class="h-20 w-20" />
                            Reddit
                        {/if}
                        <hr />
                        <span>
                            Sharing your gameplays, tutorials, reviews and cool
                            edits on social media can bring you a lot of new
                            members.
                        </span>
                    </Card>
                    <Card
                        class="p-10 text-center flex flex-col items-center gap-3"
                    >
                        <FluentEmojiFlatMoneyWithWings class="h-20 w-20" />
                        <RotateShine>
                            {code.program.cut}%
                        </RotateShine>
                        <hr />
                        <span>
                            You'll get a {code.program.cut}% cut on the net
                            amount. Starting a social media endevour can be
                            hard, publishing frequently can help you see
                            results.
                        </span>
                    </Card>
                </div>
            </div>
        </Card>
    {/if}
{:else if !joining}
    <Card class="p-5 text-center">
        Sorry, you don't have any referral programs available. Join one via a
        link shared by a friend.
    </Card>
{/if}
{#if code}
    {#key code}
        <ReferredList referralCode={code} />
    {/key}
{/if}
