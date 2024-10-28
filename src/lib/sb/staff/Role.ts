import Community from "../Community"
import type Member from "../member/Member"
import User from "../User"

export default class Role {

    id: string
    permissions: string[]
    parent: Role | null
    community: Community
    name: string

    constructor(id: string, permissions: string[], parent: Role | null, community: Community, name: string) {
        this.id = id
        this.permissions = permissions
        this.parent = parent
        this.community = community
        this.name = name
    }

    public static fromObj(community: Community, obj: any): Role {
        return new Role(
            obj.id,
            obj.permissions,
            obj.parent ? Role.fromObj(community, obj.parent) : null,
            community,
            obj.name
        )
    }

    public static async getPermissions(): Promise<string[]> {
        const user = await User.get()
        return user!.get(`/community/permissions`)
    }

    public async update(name: string, permissions: string[], parent: Role | null) {
        const user = await User.get()
        const data = await user!.patch(`/community/${this.community.id}/staff/role/${this.id}`, {
            name,
            permissions,
            parent: parent ? parent.id : undefined
        })
        return Role.fromObj(this.community, data)
    }

    public static async list() {
        const community = await Community.get()
        const user = await User.get()
        const data = await user!.get(`/community/${community!.id}/staff/role`)
        return data.map((r: any) => Role.fromObj(community!, r))
    }

    public static async create(name: string, parent: Role | null = null) {
        const community = await Community.get()
        const user = await User.get()
        const data = await user!.post(`/community/${community!.id}/staff/role`, {
            name,
            parent: parent ? parent.id : null
        })
        return Role.fromObj(community!, data)
    }

    public async delete() {
        const user = await User.get()
        await user!.delete(`/community/${this.community.id}/staff/role/${this.id}`)
    }

    public async invite(member: Member) {
        const user = await User.get()
        const data = await user!.post(`/community/${this.community.id}/staff/role/${this.id}/invite`, {
            member: member.id
        })
        return data
    }
}