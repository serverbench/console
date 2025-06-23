<script lang="ts">
    import Section from "$lib/components/sb/section/section.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
    import type Container from "$lib/sb/machine/Container";
    import { History, Loader2 } from "lucide-svelte";
    import moment from "moment";
    import { onDestroy, onMount } from "svelte";
    import { inview } from "svelte-inview";
    import Time from "svelte-time/Time.svelte";

    export let container: Container;
    export let online = false;

    let messages: [Date, string][] = [];

    let ws: WebSocket;
    let attempt = 0;

    onMount(async () => {
        await attachLogs();
    });

    let absoluteOldest: Date | null = null;
    let lastLoaded = new Date();
    let oldestLoaded = new Date();
    let hasMore = true;
    let loading = false;
    let attached = false;

    async function requestAbsoluteOldest(): Promise<Date> {
        if (absoluteOldest) return absoluteOldest;
        return new Promise(async (resolve) => {
            await container.logs(
                (line) => {
                    absoluteOldest = line[0];
                },
                () => {},
                () => {
                    if (absoluteOldest) {
                        resolve(absoluteOldest);
                    } else {
                        resolve(container.created);
                    }
                },
                new Date(0),
                lastLoaded,
                1,
            );
        });
    }

    async function requestOlder() {
        if (!hasMore) return;
        if (loading) return;
        loading = true;
        const begin = await requestAbsoluteOldest();
        let since = moment(oldestLoaded).subtract(10, "minutes").toDate();
        if (since.getTime() < begin.getTime()) {
            since = begin;
        }
        let batchCount = 0;
        await container.logs(
            (line) => {
                insertInOrder(line);
                batchCount++;
            },
            () => {},
            () => {
                loading = false;
                if (batchCount <= 0) {
                    oldestLoaded = since;
                }
                if (since.getTime() <= begin.getTime()) {
                    hasMore = false;
                }
                console.log("loaded", batchCount, "messages since", since);
            },
            since,
            oldestLoaded,
        );
    }

    function insertInOrder(line: [Date, string]) {
        const index = messages.findIndex(
            (msg) => msg[0].getTime() < line[0].getTime(), // changed > to <
        );
        if (index === -1) {
            messages.push(line);
        } else {
            messages.splice(index, 0, line);
        }
        if (oldestLoaded.getTime() > line[0].getTime()) {
            console.log("oldestLoaded", oldestLoaded, "->", line[0]);
            oldestLoaded = line[0];
        }
        if (lastLoaded.getTime() < line[0].getTime()) {
            console.log("lastLoaded", lastLoaded, "->", line[0]);
            lastLoaded = line[0];
        }
        messages = messages;
    }

    async function attachLogs() {
        if (attached) return;
        if (!online) return;
        ws = await container.logs(
            (line) => {
                insertInOrder(line);
                attempt = 0;
            },
            () => {
                attached = true;
            },
            async () => {
                attempt++;
                await new Promise((resolve) =>
                    setTimeout(resolve, 1000 * attempt),
                );
                attached = false;
                return attachLogs();
            },
            lastLoaded,
        );
    }

    $: online, attachLogs();

    onDestroy(() => {
        if (ws) {
            ws.close();
        }
    });
</script>

<Section small name="console">
    <div class="overflow-y-auto flex gap-2 p-3 h-96 flex-col-reverse">
        {#if !attached}
            {#if online}
                <Badge class="mx-auto">
                    Connecting (#{attempt}) <Loader2
                        class="animate-spin ml-2"
                    />
                </Badge>
            {:else}
                <Badge class="mx-auto">
                    Live logs will resume when the container is online
                </Badge>
            {/if}
        {/if}
        {#each messages as message}
            <div class="flex flex-row gap-2">
                <div>
                    <Badge>
                        {moment(message[0]).format("HH:mm:ss")}
                    </Badge>
                </div>
                <p>
                    {message[1]}
                </p>
            </div>
        {/each}
        {#if !hasMore}
            <p class="text-center">
                <Badge variant="outline" class="my-5">
                    beggining of {container.id}
                </Badge>
            </p>
        {:else}
            <div class="flex flex-col gap-4">
                {#if hasMore}
                    <p
                        class="mx-auto text-center flex flex-row gap-2 items-center justify-center"
                    >
                        loading until <Time
                            timestamp={oldestLoaded}
                            live
                            relative
                            class="whitespace-nowrap"
                        />
                        <Loader2 class="animate-spin ml-2" />
                    </p>
                {/if}
                {#if hasMore && !loading}
                    <div
                        use:inview
                        class="mb-2"
                        on:inview_enter={() => {
                            requestOlder();
                        }}
                    />
                {/if}
            </div>
        {/if}
    </div>
</Section>