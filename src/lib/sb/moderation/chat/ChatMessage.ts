import Toxicity from "./Toxicity";
import type Instance from "$lib/sb/server/Instance";
import InstanceSession from "$lib/sb/server/InstanceSession";
import Member from "$lib/sb/member/Member";
import type Community from "$lib/sb/Community";

export default class ChatMessage {

    public readonly from: Member
    public readonly message: string
    public readonly created: Date
    public readonly id: string
    public readonly channel: string | null
    public readonly to: Member | null
    public readonly languages: string[]
    public readonly tagged: boolean
    public readonly processed: Date | null
    public readonly session: InstanceSession
    public readonly toxicity: Toxicity | null

    constructor(
        from: Member,
        message: string,
        created: Date,
        id: string,
        channel: string | null,
        to: Member | null,
        languages: string[],
        tagged: boolean,
        processed: Date | null,
        session: InstanceSession,
        toxicity: Toxicity | null
    ) {
        this.from = from;
        this.message = message;
        this.created = created;
        this.id = id;
        this.channel = channel;
        this.to = to;
        this.languages = languages;
        this.tagged = tagged;
        this.processed = processed;
        this.session = session;
        this.toxicity = toxicity;
    }

    public static fromObj(community: Community, obj: any): ChatMessage {
        return new ChatMessage(
            Member.fromObj(
                community,
                obj.from
            ),
            obj.message,
            new Date(obj.created),
            obj.id,
            obj.channel,
            obj.to ? Member.fromObj(community, obj.to) : null,
            obj.languages || [],
            obj.tagged || false,
            obj.processed ? new Date(obj.processed) : null,
            InstanceSession.fromObj(
                null,
                obj.session
            ),
            obj.toxicity ? Toxicity.fromObj(obj.toxicity) : null
        )
    }

}