import Community from "$lib/sb/Community";
import type Instance from "$lib/sb/server/Instance";
import User from "$lib/sb/User";
import ChatMessage from "./ChatMessage";
import Toxicity from "./Toxicity";

const GOAL = 1500;
const MAX_RECENT_MESSAGES = 10;
const BATCH_SIZE = 50;
const RECONNECT_DELAY = 1000;

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

    // Cache for sorted instances to avoid re-sorting on every update
    private sortedInstancesCache: Instance[] | null = null;

    constructor(
        onConnected: (dm: boolean | null, all: boolean | null) => void = () => { },
        onMessages: (messages: ChatMessage[], toxicity: boolean, historical: boolean, trigger?: ChatMessage) => void = () => { },
        instancesUpdate: (instances: Instance[]) => void = () => { },
        onToxicity: (toxicity: ChatMessage) => void = () => { },
        onHistoric: (left: number, og: number) => void = () => { }
    ) {
        this.onConnected = onConnected;
        this.onMessages = onMessages;
        this.instancesUpdate = instancesUpdate;
        this.onToxicity = onToxicity;
        this.onHistoric = onHistoric;
    }

    private emitOnConnected(): void {
        this.onConnected(
            this.connected.get(true) ?? null,
            this.connected.get(false) ?? null
        );

        const dmConnection = this.connected.get(true);
        if (dmConnection != null) {
            this.onHistoric(this.goal, this.goal);
            this.loadHistoric(dmConnection).catch((err) => {
                console.error("Error loading historic messages:", err);
            });
        }
    }

    private async loadHistoric(dm: boolean, until: Date = new Date()): Promise<void> {
        const messages = await ChatMessage.list(dm, until);

        if (messages.length === 0) {
            this.goal = 0;
            this.onHistoric(this.goal, this.originalGoal);
            this.onMessages(this.messages, true, false);
            return;
        }

        // Process messages in batch
        let oldest: Date | null = null;
        const newMessages: ChatMessage[] = [];

        for (const message of messages) {
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

        // Update goal
        if (messages.length < BATCH_SIZE) {
            this.goal = 0;
        } else {
            this.goal -= messages.length;
        }

        this.onHistoric(this.goal, this.originalGoal);

        if (this.goal > 0 && oldest) {
            return this.loadHistoric(dm, oldest);
        } else {
            this.onMessages(this.messages, true, false);
            this.onHistoric(this.goal, this.originalGoal);
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