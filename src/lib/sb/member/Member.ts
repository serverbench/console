import Community from "../Community"
import Game from "../Game"
import User from "../User"

export default class Member {

    id: string
    eid: string
    name: string
    game: Game
    community: Community

    constructor(id: string, eid: string, name: string, game: Game, community: Community) {
        this.id = id
        this.eid = eid
        this.name = name
        this.game = game
        this.community = community
    }

    public static fromObj(community: Community, obj: any) {
        return new Member(
            obj.id,
            obj.eid,
            obj.name,
            Game.fromObj(obj.game),
            community
        )
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