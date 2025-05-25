<script lang="ts">
    import * as Avatar from "$lib/components/ui/avatar";
    import Community from "$lib/sb/Community";
    import Connection from "$lib/sb/member/Connection";
    import Member from "$lib/sb/member/Member";
    import User from "$lib/sb/User";
    import { createEventDispatcher, onMount } from "svelte";
    import { fade, scale, slide } from "svelte/transition";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import Card from "$lib/components/ui/card/card.svelte";
    import Section from "$lib/components/sb/section/section.svelte";
    import Item from "$lib/components/sb/section/list/Item.svelte";
    import { History } from "lucide-svelte";
    import Time from "svelte-time";
    import { flip } from "svelte/animate";
    import Country from "$lib/components/sb/country.svelte";
    import { toast } from "svelte-sonner";

    const dispatch = createEventDispatcher();

    let list: Connection[] = [];

    onMount(async () => {
        const community = await Community.get();
        const user = await User.get();
        let firstLoad = true;
        const ws = user!.socket(
            `community.${community!.id}.member.connection`,
            (data) => {
                const newList: Connection[] = data.map((i: any) =>
                    Connection.fromObj(i, Member.fromObj(community!, i.member)),
                );
                if (!firstLoad) {
                    let leftToHandle = list;
                    for (const connection of newList) {
                        const alreadyConnected = list.find(
                            (c) => c.member.id == connection.member.id,
                        );
                        if (!alreadyConnected) {
                            toast.info(`${connection.member.name} connected`);
                        }
                        leftToHandle = leftToHandle.filter(
                            (c) => c.member.id != connection.member.id,
                        );
                    }
                    for (const connection of leftToHandle) {
                        toast.info(`${connection.member.name} disconnected`);
                    }
                } else {
                    firstLoad = false;
                }
                list = newList;
                dispatch("update", { list });
            },
        );
    });
</script>

<Section name="Online Members" list used={list.length}>
    {#each list as connection, index (connection.member.id)}
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
