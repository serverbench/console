import Community from "../Community"
import Member from "../member/Member"
import User from "../User"
import Role from "./Role"
import Staff from "./Staff"

export default class Invite {

    id: string
    community: Community
    member: Member
    role: Role

    constructor(id: string, community: Community, member: Member, role: Role) {
        this.id = id
        this.community = community
        this.member = member
        this.role = role
    }

    public static fromObj(community: Community, obj: any) {
        return new Invite(
            obj.id,
            community,
            Member.fromObj(community, obj.member),
            Role.fromObj(community, obj.role)
        )
    }

    public static async list() {
        const community = await Community.get()
        const user = await User.get()
        const data = await user!.get(`/community/${community!.id}/staff/invite`)
        return data.map((i: any) => Invite.fromObj(community!, i))
    }

    public static async get(id: string) {
        const user = await User.get()!
        const data = await user!.get(`/community/invite/${id}`)
        return Invite.fromObj(
            Community.fromObj(data.community),
            data
        )
    }

    public async delete() {
        const user = await User.get()!
        const community = await Community.get()!
        await user!.delete(`/community/${community!.id}/staff/invite/${this.id}`)
    }

    public async accept() {
        const user = await User.get()!
        const data = await user!.post(`/community/${this.community.id}/staff/invite/${this.id}`)
        return Staff.fromObj(this.community, data)
    }

}