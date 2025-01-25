<script lang="ts">
    import * as Avatar from "$lib/components/ui/avatar";
    import Community from "$lib/sb/Community";
    import Connection from "$lib/sb/member/Connection";
    import Member from "$lib/sb/member/Member";
    import User from "$lib/sb/User";
    import { onMount } from "svelte";
    import { fade, scale, slide } from "svelte/transition";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import Card from "$lib/components/ui/card/card.svelte";
    import Section from "$lib/components/sb/section/section.svelte";
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import { History } from "lucide-svelte";
    import Time from "svelte-time";
    import { flip } from "svelte/animate";
    import Country from "$lib/components/sb/country.svelte";

    let list: Connection[] = [];

    onMount(async () => {
        const community = await Community.get();
        const user = await User.get();
        const ws = user!.socket(
            `community.${community!.id}.member.connection`,
            (data) => {
                console.log(data);
                list = data.map((i: any) =>
                    Connection.fromObj(i, Member.fromObj(community!, i.member)),
                );
            },
        );
    });
</script>

<Section name="Online Members" list used={list.length}>
    {#each list as connection, index (connection.id)}
        <div animate:flip class:border-b={index < list.length - 1}>
            <Item>
                <Tooltip.Root>
                    <Tooltip.Trigger>
                        <div class="relative">
                            <Avatar.Root class="border">
                                <Avatar.Image
                                    src={`https://minotar.net/avatar/${connection.member.eid}`}
                                />
                                <Avatar.Fallback
                                    >{connection.member.name[0].toUpperCase()}</Avatar.Fallback
                                >
                            </Avatar.Root>
                            {#if connection.idle}
                                <div
                                    class="absolute -top-1 -right-1 bg-black p-1 rounded-full bg-opacity-50 backdrop-blur-md text-white"
                                >
                                    <History />
                                </div>
                            {/if}
                        </div>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p>{connection.member.name}</p>
                    </Tooltip.Content>
                </Tooltip.Root>
                <div class="grow">
                    {connection.member.name}
                </div>
                <Time live relative timestamp={connection.created} />
                <Country country={connection.country} />
            </Item>
        </div>
    {/each}
</Section>
