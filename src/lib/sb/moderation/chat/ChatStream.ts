import Community from "$lib/sb/Community";
import User from "$lib/sb/User";
import ChatMessage from "./ChatMessage";
import Toxicity from "./Toxicity";

export default class ChatStream {

    private connected: Map<boolean, boolean | null> = new Map();
    private recentMessages: Map<string, ChatMessage> = new Map();
    private messages: ChatMessage[] = [];

    private onConnected: (dm: boolean | null, all: boolean | null) => void = () => { };
    private onMessages: (messages: ChatMessage[]) => void = () => { };

    constructor(
        onConnected: (dm: boolean | null, all: boolean | null) => void = () => { },
        onMessages: (messages: ChatMessage[]) => void = () => { },
    ) {
        this.onConnected = onConnected;
        this.onMessages = onMessages;
    }

    private emitOnConnected(): void {
        this.onConnected(
            this.connected.has(true) ? this.connected.get(true)! : null,
            this.connected.has(false) ? this.connected.get(false)! : null,
        );
    }

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
        user!.pipe(
            action,
            {},
            (data) => {
                if (data.type == "msg") {
                    const msg = ChatMessage.fromObj(community!, data.message);
                    this.messages.unshift(msg);
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
                } else if (data.type == "toxicity") {
                    const parentId = data.parent;
                    const message = this.recentMessages.get(parentId);
                    if (message) {
                        message.setToxicity(Toxicity.fromObj(data.toxicity));
                    }
                }
                this.onMessages(this.messages);
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
        );
    }
}