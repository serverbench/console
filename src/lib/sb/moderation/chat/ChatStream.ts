import Community from "$lib/sb/Community";
import type Instance from "$lib/sb/server/Instance";
import User from "$lib/sb/User";
import ChatMessage from "./ChatMessage";
import Toxicity from "./Toxicity";

const GOAL = 1500;
const MAX_RECENT_MESSAGES = 10;
const BATCH_SIZE = 50;
const RECONNECT_DELAY = 1000;
const CACHE_KEY_PREFIX = "chat:historic:";
const CACHE_VERSION = "v1";

interface HistoricCache {
    version: string;
    dm: boolean;
    messages: any[]; // Full message objects from toObj()
    lastUpdated: string;
}

export default class ChatStream {
    private connected: Map<boolean, boolean | null> = new Map();
    private recentMessages: ChatMessage[] = []; // Array for O(1) operations
    private recentMessageIds = new Set<string>(); // Fast lookup for duplicates
    private messages: ChatMessage[] = [];
    private instances: Map<string, Instance> = new Map();
    private goal = GOAL;
    private originalGoal = GOAL;
    private seenMsgs = new Set<string>();

    private onConnected: (dm: boolean | null, all: boolean | null) => void;
    private onMessages: (messages: ChatMessage[], toxicity: boolean, historical: boolean, trigger?: ChatMessage) => void;
    private instancesUpdate: (instances: Instance[]) => void;
    private onToxicity: (toxicity: ChatMessage) => void;
    private onHistoric: (left: number, og: number) => void;

    private ws: WebSocket[] = [];
    private closed = false;
    private community: Community

    // Cache for sorted instances to avoid re-sorting on every update
    private sortedInstancesCache: Instance[] | null = null;

    constructor(
        onConnected: (dm: boolean | null, all: boolean | null) => void = () => { },
        onMessages: (messages: ChatMessage[], toxicity: boolean, historical: boolean, trigger?: ChatMessage) => void = () => { },
        instancesUpdate: (instances: Instance[]) => void = () => { },
        onToxicity: (toxicity: ChatMessage) => void = () => { },
        onHistoric: (left: number, og: number) => void = () => { },
        community: Community
    ) {
        this.onConnected = onConnected;
        this.onMessages = onMessages;
        this.instancesUpdate = instancesUpdate;
        this.onToxicity = onToxicity;
        this.onHistoric = onHistoric;
        this.community = community;
    }

    private getCacheKey(dm: boolean): string {
        return `${CACHE_KEY_PREFIX}${this.community.id}:${dm ? 'dm' : 'public'}`;
    }

    private loadCachedMessages(dm: boolean): HistoricCache | null {
        try {
            const cached = localStorage.getItem(this.getCacheKey(dm));
            if (!cached) return null;

            const cache: HistoricCache = JSON.parse(cached);

            // Validate cache version and dm flag
            if (cache.version !== CACHE_VERSION || cache.dm !== dm) {
                this.clearCache(dm);
                return null;
            }

            return cache;
        } catch (error) {
            console.warn("Error loading cached messages:", error);
            this.clearCache(dm);
            return null;
        }
    }

    private saveCachedMessages(dm: boolean, messages: ChatMessage[]): void {
        try {
            const messageObjects = messages.map(msg => msg.toObj());

            const cache: HistoricCache = {
                version: CACHE_VERSION,
                dm,
                messages: messageObjects,
                lastUpdated: new Date().toISOString()
            };

            localStorage.setItem(this.getCacheKey(dm), JSON.stringify(cache));
        } catch (error) {
            console.warn("Error saving cached messages:", error);
        }
    }

    private clearCache(dm: boolean): void {
        try {
            localStorage.removeItem(this.getCacheKey(dm));
        } catch (error) {
            console.warn("Error clearing cache:", error);
        }
    }

    private isCachedMessage(messageId: string, cachedMessages: any[]): boolean {
        return cachedMessages.some(cached => cached.id === messageId);
    }

    private findCacheStopPoint(messages: ChatMessage[], cachedMessages: any[]): number {
        // Find the first message that exists in cache
        for (let i = 0; i < messages.length; i++) {
            if (this.isCachedMessage(messages[i].id, cachedMessages)) {
                return i; // Stop before this message (don't include cached ones)
            }
        }
        return messages.length; // No cached messages found, process all
    }

    private emitOnConnected(): void {
        this.onConnected(
            this.connected.get(true) ?? null,
            this.connected.get(false) ?? null
        );

        const dmConnection = this.connected.get(true);
        if (dmConnection != null) {
            this.onHistoric(this.goal, this.goal);
            this.loadHistoricWithCache(dmConnection).catch((err) => {
                console.error("Error loading historic messages:", err);
            });
        }
    }

    private async loadHistoricWithCache(dm: boolean): Promise<void> {
        // First, load cached messages from localStorage
        const cache = this.loadCachedMessages(dm);

        if (cache && cache.messages.length > 0) {
            console.log(`Loading ${cache.messages.length} cached messages from localStorage`);

            // Get community for fromObj
            const community = await Community.get();
            if (!community) {
                console.warn("No community found, clearing cache and loading normally");
                this.clearCache(dm);
                return this.loadHistoric(dm);
            }

            // Convert cached objects back to ChatMessage instances
            const cachedChatMessages: ChatMessage[] = [];
            for (const msgObj of cache.messages) {
                try {
                    const chatMessage = ChatMessage.fromObj(community, msgObj);
                    if (!this.seenMsgs.has(chatMessage.id)) {
                        cachedChatMessages.push(chatMessage);
                        this.seenMsgs.add(chatMessage.id);
                    }
                } catch (error) {
                    console.warn("Error converting cached message:", error);
                }
            }

            // Add cached messages to our messages array
            if (cachedChatMessages.length > 0) {
                this.batchInsertMessages(cachedChatMessages);

                // Update instances from cached messages
                for (const msg of cachedChatMessages) {
                    if (!this.instances.has(msg.session.instance.id)) {
                        this.instances.set(msg.session.instance.id, msg.session.instance);
                        this.sortedInstancesCache = null;
                        this.updateInstancesCallback();
                    }
                }

                // Update UI with cached messages
                this.onMessages(this.messages, true, false);
            }

            // Reduce the goal by the number of cached messages to prevent over-loading
            this.goal = Math.max(0, this.goal - cachedChatMessages.length);
            this.onHistoric(this.goal, this.originalGoal);

            // Only load new messages if we still have goal remaining
            if (this.goal > 0) {
                // Find the newest cached message to know where to start loading new ones
                if (cachedChatMessages.length > 0) {
                    const newestCachedTime = Math.max(...cachedChatMessages.map(m => m.created.getTime()));
                    const newestCached = new Date(newestCachedTime);

                    // Load newer messages from API
                    await this.loadHistoric(dm, newestCached);
                } else {
                    // No valid cached messages, load normally
                    await this.loadHistoric(dm);
                }
            } else {
                // Goal satisfied by cache, we're done
                this.onMessages(this.messages, true, false);
                this.onHistoric(0, this.originalGoal);
            }
        } else {
            // No cache, load normally
            await this.loadHistoric(dm);
        }
    }

    private async loadHistoric(dm: boolean, until: Date = new Date()): Promise<void> {
        // Safety check to prevent infinite recursion
        if (this.goal <= 0) {
            console.log("Goal reached, stopping historic load");
            this.onMessages(this.messages, true, false);
            this.onHistoric(0, this.originalGoal);
            return;
        }

        const messages = await ChatMessage.list(dm, until);

        if (messages.length === 0) {
            console.log("No more messages available");
            this.goal = 0;
            this.onHistoric(this.goal, this.originalGoal);
            this.onMessages(this.messages, true, false);
            return;
        }

        // Load cached messages for comparison
        const cache = this.loadCachedMessages(dm);
        const cachedMessages = cache?.messages || [];

        // Find where to stop based on cached data
        const stopIndex = this.findCacheStopPoint(messages, cachedMessages);
        const messagesToProcess = messages.slice(0, stopIndex);

        console.log(`Processing ${messagesToProcess.length} new messages, found ${messages.length - stopIndex} cached messages`);

        // Process messages in batch
        let oldest: Date | null = null;
        const newMessages: ChatMessage[] = [];

        for (const message of messagesToProcess) {
            if (!this.seenMsgs.has(message.id)) {
                if (oldest == null || message.created.getTime() < oldest.getTime()) {
                    oldest = message.created;
                }
                newMessages.push(message);
                this.seenMsgs.add(message.id);
            }
        }

        // Batch insert new messages
        if (newMessages.length > 0) {
            this.batchInsertMessages(newMessages);
        }

        // Update goal based on processed messages and cache hit
        const hitCache = stopIndex < messages.length;

        if (hitCache) {
            // We hit cached data, stop loading
            console.log("Hit cached data, stopping historic load");
            this.goal = 0;
        } else if (messages.length < BATCH_SIZE) {
            // No more messages available
            console.log("Reached end of available messages");
            this.goal = 0;
        } else {
            // Continue loading
            this.goal -= newMessages.length; // Only subtract messages we actually processed
        }

        this.onHistoric(this.goal, this.originalGoal);

        // Continue loading if we haven't hit cache and still have goal remaining AND we have an oldest date
        if (this.goal > 0 && oldest && !hitCache && newMessages.length > 0) {
            // Add a small safety delay to prevent runaway loops
            await new Promise(resolve => setTimeout(resolve, 10));
            return this.loadHistoric(dm, oldest);
        } else {
            // Finished loading - save cache and update UI
            console.log("Historic loading complete");
            if (this.messages.length > 0) {
                this.saveCachedMessages(dm, this.messages);
            }

            this.onMessages(this.messages, true, false);
            this.onHistoric(0, this.originalGoal);

            for (const msg of this.messages) {
                // Update instances if new
                if (!this.instances.has(msg.session.instance.id)) {
                    this.instances.set(msg.session.instance.id, msg.session.instance);
                    this.sortedInstancesCache = null; // Invalidate cache
                    this.updateInstancesCallback();
                }
            }
        }
    }

    private batchInsertMessages(newMessages: ChatMessage[]): void {
        // Sort new messages by creation time
        newMessages.sort((a, b) => b.created.getTime() - a.created.getTime());

        // Merge with existing messages (assuming messages are kept in reverse chronological order)
        if (this.messages.length === 0) {
            this.messages = newMessages;
        } else {
            const merged: ChatMessage[] = [];
            let i = 0, j = 0;

            while (i < this.messages.length && j < newMessages.length) {
                if (this.messages[i].created.getTime() >= newMessages[j].created.getTime()) {
                    merged.push(this.messages[i]);
                    i++;
                } else {
                    merged.push(newMessages[j]);
                    j++;
                }
            }

            // Add remaining messages
            while (i < this.messages.length) merged.push(this.messages[i++]);
            while (j < newMessages.length) merged.push(newMessages[j++]);

            this.messages = merged;
        }
    }

    private addToRecentMessages(msg: ChatMessage): void {
        // Check if message already exists
        if (this.recentMessageIds.has(msg.id)) return;

        this.recentMessages.unshift(msg); // Add to beginning
        this.recentMessageIds.add(msg.id);

        // Trim if exceeds max size
        if (this.recentMessages.length > MAX_RECENT_MESSAGES) {
            const removed = this.recentMessages.pop()!; // Remove from end
            this.recentMessageIds.delete(removed.id);
        }
    }

    private processMessage(msg: ChatMessage): void {
        if (this.seenMsgs.has(msg.id)) return;

        // Use binary search to find insertion point for better performance
        const insertIndex = this.binarySearchInsertIndex(msg.created.getTime());
        this.messages.splice(insertIndex, 0, msg);

        this.addToRecentMessages(msg);

        // Update instances if new
        if (!this.instances.has(msg.session.instance.id)) {
            this.instances.set(msg.session.instance.id, msg.session.instance);
            this.sortedInstancesCache = null; // Invalidate cache
            this.updateInstancesCallback();
        }

        this.seenMsgs.add(msg.id);

        // Update cache with new message (you might want to debounce this for performance)
        // For now, we'll only update cache during the initial historic load
    }

    private binarySearchInsertIndex(timestamp: number): number {
        let left = 0;
        let right = this.messages.length;

        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (this.messages[mid].created.getTime() > timestamp) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        return left;
    }

    private updateInstancesCallback(): void {
        if (!this.sortedInstancesCache) {
            this.sortedInstancesCache = Array.from(this.instances.values())
                .sort((a, b) => `${b.server.slug}-${b.name ?? 'main'}`.localeCompare(`${a.server.slug}-${a.name ?? 'main'}`));
        }
        this.instancesUpdate(this.sortedInstancesCache);
    }

    private findRecentMessage(id: string): ChatMessage | undefined {
        return this.recentMessages.find(msg => msg.id === id);
    }

    // Method to manually clear cache (useful for debugging or forced refresh)
    public clearAllCache(): void {
        this.clearCache(true);  // DM cache
        this.clearCache(false); // Public cache
    }

    async stream() {
        const connections = [false, true];

        await Promise.allSettled(
            connections.map(connection => this.connect(connection))
        );

        return this;
    }

    close(): void {
        this.closed = true;
        this.ws.forEach(socket => {
            try {
                socket.close();
            } catch (error) {
                // Ignore close errors
            }
        });
        this.ws = [];
    }

    async connect(dm: boolean = false): Promise<void> {
        if (this.closed) return;

        const user = await User.get();
        const community = await Community.get();

        if (!this.connected.has(dm)) {
            this.connected.set(dm, null);
        }

        this.emitOnConnected();

        const action = dm
            ? `community.${community!.id}.chat`
            : `community.${community!.id}.chat.public`;

        console.log('piping', action);

        const socket = user!.pipe(
            action,
            {},
            (data) => {
                if (this.closed) return;

                if (data.type === "msg") {
                    const msg = ChatMessage.fromObj(community!, data.message);
                    this.processMessage(msg);
                    this.onMessages(this.messages, false, false, msg);
                } else if (data.type === "toxicity") {
                    const message = this.findRecentMessage(data.parent);
                    if (message) {
                        const tox = Toxicity.fromObj(data.toxicity);
                        message.setToxicity(tox);
                        this.onToxicity(message);
                        this.onMessages(this.messages, true, false, message);
                    }
                }
            },
            () => {
                this.connected.set(dm, true);
                this.emitOnConnected();
            },
            () => {
                this.connected.set(dm, false);
                if (this.connected.get(dm) !== null && !this.closed) {
                    setTimeout(() => this.connect(dm), RECONNECT_DELAY);
                }
                this.emitOnConnected();
            }
        );

        this.ws.push(socket);
    }
}