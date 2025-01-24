<script lang="ts">
    import * as Avatar from "$lib/components/ui/avatar";
    import Community from "$lib/sb/Community";
    import Connection from "$lib/sb/member/Connection";
    import Member from "$lib/sb/member/Member";
    import User from "$lib/sb/User";
    import { onMount } from "svelte";
    import { fade, scale } from "svelte/transition";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import Card from "$lib/components/ui/card/card.svelte";
    import Section from "$lib/components/sb/section/section.svelte";

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

<Section name="Online Members">
    <div class="grid grid-cols-5 lg:grid-cols-10 gap-5 p-5">
        {#each list as connection}
            <div transition:fade>
                <Tooltip.Root>
                    <Tooltip.Trigger>
                        <Avatar.Root class="border">
                            <Avatar.Image
                                src={`https://minotar.net/avatar/${connection.member.eid}`}
                                alt="@shadcn"
                            />
                            <Avatar.Fallback
                                >{connection.member.name[0].toUpperCase()}</Avatar.Fallback
                            >
                        </Avatar.Root>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p>{connection.member.name}</p>
                    </Tooltip.Content>
                </Tooltip.Root>
            </div>
        {/each}
    </div>
    
</Section>