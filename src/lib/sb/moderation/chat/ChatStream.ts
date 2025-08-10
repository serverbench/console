import Community from "$lib/sb/Community";
import type Instance from "$lib/sb/server/Instance";
import User from "$lib/sb/User";
import { sort } from "fast-sort";
import ChatMessage from "./ChatMessage";
import Toxicity from "./Toxicity";

export default class ChatStream {

    private connected: Map<boolean, boolean | null> = new Map();
    private recentMessages: Map<string, ChatMessage> = new Map();
    private messages: ChatMessage[] = [];
    private instances: Map<string, Instance> = new Map();
    private goal = 1000;
    private seenMsgs = new Set<string>();

    private onConnected: (dm: boolean | null, all: boolean | null) => void = () => { };
    private onMessages: (messages: ChatMessage[], toxicity: boolean) => void = () => { };
    private instancesUpdate: (instances: Instance[]) => void = () => { };
    private onToxicity: (toxicity: ChatMessage) => void = () => { };
    private onHistoric: (left: number, og: number) => void = () => { };

    constructor(
        onConnected: (dm: boolean | null, all: boolean | null) => void = () => { },
        onMessages: (messages: ChatMessage[], toxicity: boolean) => void = () => { },
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
            this.connected.has(true) ? this.connected.get(true)! : null,
            this.connected.has(false) ? this.connected.get(false)! : null,
        );
        if (this.connected.has(true) && this.connected.get(true) != null) {
            this.onHistoric(this.goal, this.goal)
            this.loadHistoric(this.connected.get(true)!).then(() => { }).catch((err) => {
                console.error("Error loading historic messages:", err);
            })
        }
    }

    private async loadHistoric(dm: boolean, until: Date = new Date(), ogGoal = Number(this.goal)): Promise<void> {
        const messages = await ChatMessage.list(dm, until)
        let oldest: Date | null = null
        for (const message of messages) {
            if (oldest == null || message.created.getTime() < oldest.getTime()) {
                oldest = message.created;
            }
            this.processMessage(message);
        }
        this.onMessages(this.messages, true)
        this.goal -= messages.length;
        this.onHistoric(this.goal, ogGoal)
        if (messages.length >= 50 && this.goal > 0) {
            return this.loadHistoric(dm, oldest!)
        }
    }

    private ws: WebSocket[] = []

    async stream() {
        const connections = [
            false,
            true,
        ]
        for (const connection of connections) {
            this.connect(connection).then(() => { }).catch((err) => {
                console.error("Error connecting to chat stream:", err);
            })
        }
        return this
    }

    private closed = false;
    close() {
        this.closed = true
        for (const s of this.ws) {
            try {
                s.close()
            } catch (error) {

            }
        }
    }

    private processMessage(msg: ChatMessage): void {
        if (this.seenMsgs.has(msg.id)) {
            return;
        }
        const insertIndex = this.messages.findIndex(
            (m) => m.created.getTime() < msg.created.getTime()
        );
        if (insertIndex === -1) {
            this.messages.push(msg); // oldest at end
        } else {
            this.messages.splice(insertIndex, 0, msg);
        }
        this.recentMessages.set(msg.id, msg);
        // delete oldest recentMessages if more than 10
        if (this.recentMessages.size > 10) {
            const oldest = Array.from(this.recentMessages.values()).sort(
                (a, b) => a.created.getTime() - b.created.getTime(),
            )[0];
            if (oldest) {
                this.recentMessages.delete(oldest.id);
            }
        }
        if (!this.instances.has(msg.session.instance.id)) {
            this.instances.set(msg.session.instance.id, msg.session.instance);
            const sortedInstances = sort(Array.from(this.instances.values())).desc((i) => `${i.server.slug}-${i.name ?? 'main'}`)
            this.instancesUpdate(sortedInstances);
        }
        this.seenMsgs.add(msg.id);
    }

    async connect(dm: boolean = false): Promise<void> {
        const user = await User.get();
        const community = await Community.get();
        if (!this.connected.has(dm)) {
            this.connected.set(dm, null)
        }
        this.emitOnConnected();
        const action = dm ? `community.${community!.id}.chat` : `community.${community!.id}.chat.public`
        console.log('piping', action)
        this.ws.push(user!.pipe(
            action,
            {},
            (data) => {
                if (this.closed) return
                if (data.type == "msg") {
                    const msg = ChatMessage.fromObj(community!, data.message);
                    this.processMessage(msg)
                } else if (data.type == "toxicity") {
                    const parentId = data.parent;
                    const message = this.recentMessages.get(parentId);
                    if (message) {
                        const tox = Toxicity.fromObj(data.toxicity)
                        message.setToxicity(tox);
                        this.onToxicity(message)
                    }
                }
                this.onMessages(this.messages, data.type == "toxicity");
            },
            () => {
                this.connected.set(dm, true);
                this.emitOnConnected();
            },
            () => {
                this.connected.set(dm, false);
                if (this.connected.get(dm) != null) {
                    setTimeout(() => {
                        this.connect(dm)
                    }, 1000);
                }
                this.emitOnConnected();
            },
        ))
    }
}