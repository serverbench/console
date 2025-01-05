import Community from "../Community"
import Game from "../Game"
import User from "../User"
import Connection from "./Connection"

export default class Member {

    public readonly id: string
    public readonly eid: string
    public readonly name: string
    public readonly game: Game
    public readonly community: Community
    private _firstConnection: Connection | null

    constructor(id: string, eid: string, name: string, game: Game, community: Community, firstConnection: Connection | null = null) {
        this.id = id
        this.eid = eid
        this.name = name
        this.game = game
        this.community = community
        this._firstConnection = firstConnection
    }

    public get firstConnection() {
        return this._firstConnection
    }

    public static fromObj(community: Community, obj: any) {
        const member = new Member(
            obj.id,
            obj.eid,
            obj.name,
            Game.fromObj(obj.game),
            community
        )
        if (obj.firstConnection) {
            member._firstConnection = Connection.fromObj(obj.firstConnection, member)
        }
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

}