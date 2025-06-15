import Community from "$lib/sb/Community"
import User from "$lib/sb/User"
import BriefingSection from "./BriefingSection"

export enum BriefingPrompt {
    PRIVATE = 'private',
    PUBLIC = 'public',
}

export interface IBriefing {
    id: string,
    from: Date,
    to: Date,
    created: Date,
    prompt: BriefingPrompt,
}

export default class Briefing implements IBriefing {

    public readonly community: Community
    public readonly id: string
    public readonly created: Date
    public readonly from: Date
    public readonly to: Date
    public readonly url: string | null
    public readonly htmlUrl: string | null
    public readonly prompt: BriefingPrompt
    private _sections: BriefingSection[]
    public get sections(): BriefingSection[] {
        return this._sections;
    }

    private constructor(community: Community, id: string, created: Date, from: Date, to: Date, url: string | null, htmlUrl: string | null, prompt: BriefingPrompt, sections: BriefingSection[]) {
        this.community = community
        this.id = id
        this.created = created
        this.from = from
        this.to = to
        this.url = url
        this.htmlUrl = htmlUrl
        this.prompt = prompt
        this._sections = sections
    }

    public static fromObject(obj: any, community: Community): Briefing {
        const briefing = new Briefing(
            community,
            obj.id,
            new Date(obj.created),
            new Date(obj.from),
            new Date(obj.to),
            obj.url || null,
            obj.htmlUrl || null,
            obj.prompt,
            []
        );
        briefing._sections = (obj.sections || []).map((section: any) => BriefingSection.fromObject(section, briefing))
        return briefing
    }

    public static async getList(): Promise<IBriefing[]> {
        const user = await User.get()
        const community = await Community.get()
        return (await user!.get(`/community/${community!.id}/briefing`)).map((obj: any) => {
            return {
                id: obj.id,
                from: new Date(obj.from),
                to: new Date(obj.to),
                created: new Date(obj.created),
                prompt: obj.prompt as BriefingPrompt,
            } as IBriefing;
        })
    }

    public static async get(id: string): Promise<Briefing> {
        const user = await User.get()
        const community = await Community.get()
        const obj = await user!.get(`/community/${community!.id}/briefing/${id}`)
        return Briefing.fromObject(obj, community!);
    }

}