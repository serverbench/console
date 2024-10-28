import Community from "../Community"
import Member from "../member/Member"
import User from "../User"
import Role from "./Role"

export default class Staff {

    id: string
    member: Member
    role: Role
    community: Community

    constructor(id: string, member: Member, role: Role, community: Community) {
        this.id = id
        this.member = member
        this.role = role
        this.community = community
    }

    public static fromObj(community: Community, obj: any) {
        return new Staff(
            obj.id,
            Member.fromObj(community, obj.member),
            Role.fromObj(community, obj.role),
            community
        )
    }

    public static async list() {
        const community = await Community.get()
        const user = await User.get()
        const data = await user!.get(`/community/${community!.id}/staff`)
        return data.map((i: any) => Staff.fromObj(community!, i))
    }

    public async delete() {
        const user = await User.get()!
        const community = await Community.get()!
        await user!.delete(`/community/${community!.id}/staff/${this.id}`)
    }

    public async update(role: Role) {
        const user = await User.get()!
        const community = await Community.get()!
        const data = await user!.patch(`/community/${community!.id}/staff/${this.id}`, {
            role: role.id
        })
        return Staff.fromObj(community!, data)
    }

}