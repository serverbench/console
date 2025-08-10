import Community from "../Community"
import Game from "../Game"
import ChatMessage from "../moderation/chat/ChatMessage"
import User from "../User"
import Connection, { type InstanceCount } from "./Connection"

export type ChatMessageFilter = {
    minToxicity?: number,
    minToxicityProfanity?: number,
    minToxicityAverage?: number,
    minToxicityAverageProfanity?: number,
    tagged?: boolean
}

export type Relation = {
    member: Member,
    weight: number,
    to?: Relation[]
}

export default class Member {

    public readonly created: Date
    public readonly id: string
    public readonly eid: string
    public readonly name: string
    public readonly game: Game
    public readonly community: Community

    constructor(id: string, created: Date, eid: string, name: string, game: Game, community: Community) {
        this.id = id
        this.created = created
        this.eid = eid
        this.name = name
        this.game = game
        this.community = community
    }

    public toObj() {
        return {
            id: this.id,
            created: this.created.getTime(),
            eid: this.eid,
            name: this.name,
            game: {
                slug: this.game.slug
            },
            community: this.community.toObj(),
        }
    }

    public static async import(file: File) {
        const user = await User.get()
        const community = await Community.get()
        await user!.post(`/community/${community!.id}/member/import`, file)
    }

    public static fromObj(community: Community, obj: any) {
        const member = new Member(
            obj.id,
            new Date(obj.created),
            obj.eid,
            obj.name,
            Game.fromObj(obj.game),
            community
        )
        return member
    }

    public static async search(username: string, eid: string | null = null) {
        const user = await User.get()
        const community = await Community.get()
        return Member.fromObj(community!, await user!.post(`/community/${community!.id}/member/search`, {
            username,
            eid: eid ?? undefined
        }))
    }

    public static async list(page: number = 0) {
        const community = await Community.get()
        const user = await User.get()
        const data = await user!.post(`/community/${community!.id}/member`, {
            page
        })
        return data.map((d: any) => Member.fromObj(community!, d))
    }

    public static async fromId(id: string) {
        const user = await User.get()
        const community = await Community.get()
        return Member.fromObj(community!, await user!.get(`/community/${community!.id}/member/${id}`))
    }

    public async getCountry() {
        const user = await User.get()
        const community = await Community.get()
        return (await user!.get(`/community/${community!.id}/member/${this.id}/country`)).country
    }

    public async getFavoriteInstances(anchor = new Date()) {
        const user = await User.get()
        const community = await Community.get()
        return (await user!.post(`/community/${community!.id}/member/${this.id}/instances`, {
            anchor: anchor.getTime()
        })) as InstanceCount[]
    }

    public async getChatMessages(page: number = 0, anchor: Date = new Date(), filters?: ChatMessageFilter): Promise<ChatMessage[]> {
        const user = await User.get()
        const community = await Community.get()
        return (await user!.post(`/community/${community!.id}/chat/member/${this.id}`, {
            page,
            anchor: anchor.getTime(),
            minToxicity: filters?.minToxicity,
            minToxicityProfanity: filters?.minToxicityProfanity,
            minToxicityAverage: filters?.minToxicityAverage,
            minToxicityAverageProfanity: filters?.minToxicityAverageProfanity,
            tagged: filters?.tagged
        })).map((c: any) => ChatMessage.fromObj(community!, c))
    }

    public async getChatRelations(): Promise<Relation[]> {
        const user = await User.get()
        const community = await Community.get()
        const data = await user!.get(`/community/${community!.id}/chat/relations/${this.id}`)
        const relations: Relation[] = []
        for (const relation of data) {
            const member = Member.fromObj(this.community, relation.member)
            const rel: Relation = {
                member,
                weight: relation.weight,
                to: relation.to ? relation.to.map((r: any) => ({
                    member: Member.fromObj(this.community, r.member),
                    weight: r.weight
                })) : undefined
            }
            relations.push(rel)
        }
        return relations
    }

    public async getConnections(page: number = 0, anchor: Date = new Date()): Promise<Connection[]> {
        const user = await User.get()
        const community = await Community.get()
        return (await user!.post(`/community/${community!.id}/activity/connection/member/${this.id}`, {
            page,
            anchor: anchor.getTime()
        })).map((c: any) => Connection.fromObj(c, this))
    }

    public async getActivityCalendar() {
        return await Connection.getActivityCalendar(this)
    }

    public async getActivityClock() {
        return this.community.getActivityClock(this)
    }

}