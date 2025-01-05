import Community from "../Community";
import Member from "../member/Member";
import User from "../User";

export default class ReferralProgram {

    id: string
    community: Community
    cut: number

    constructor(community: Community, id: string, cut: number) {
        this.community = community
        this.id = id
        this.cut = cut
    }

    public static fromObj(obj: any, community: Community | null = null) {
        return new ReferralProgram(
            community ? community : Community.fromObj(obj.community),
            obj.id,
            obj.cut
        )
    }

    public static async create(cut: number): Promise<ReferralProgram> {
        const user = await User.get()
        const community = await Community.get()
        const data = await user!.post(`/community/${community!.id}/referral/program`, { cut })
        return ReferralProgram.fromObj(data, community)
    }

    public static async get(): Promise<ReferralProgram[]> {
        const user = await User.get()
        const community = await Community.get()
        const data = await user!.get(`/community/${community!.id}/referral/program`)
        return data.map((d: any) => ReferralProgram.fromObj(d, community))
    }

    public async delete(): Promise<void> {
        const user = await User.get()
        const community = await Community.get()
        await user!.delete(`/community/${community!.id}/referral/program/${this.id}`)
    }

    public static async preview(community: string, programId: string): Promise<ReferralProgram> {
        const user = await User.get()
        const data = await user!.get(`/community/${community}/referral/program/${programId}`)
        return ReferralProgram.fromObj(data)
    }

    public async getJoiningMembers(page: number): Promise<Member[]> {
        const user = await User.get()
        const members = await user!.post(`/community/${this.community.id}/referral/program/${this.id}/joined`, {
            page
        })
        return members.map((m: any) => Member.fromObj(this.community!, m))
    }
}