import type Community from "../Community"
import Member from "../member/Member"
import User from "../User"
import ReferralProgram from "./ReferralProgram"

export default class ReferralCode {

    public readonly id: string
    public readonly program: ReferralProgram
    public readonly code: string

    constructor(id: string, program: ReferralProgram, code: string) {
        this.id = id
        this.program = program
        this.code = code
    }

    public static fromObj(obj: any, community: Community | null = null) {
        return new ReferralCode(obj.id, ReferralProgram.fromObj(obj.program, community), obj.code)
    }

    public static async joinProgram(community: string, programId: string): Promise<ReferralCode> {
        const user = await User.get()
        const data = await user!.post(`/community/${community}/referral/program/${programId}`)
        return ReferralCode.fromObj(data)
    }

    public static async get(): Promise<ReferralCode[]> {
        const user = await User.get()
        const data = await user!.get(`/user/referral/code`)
        return data.map((d: any) => ReferralCode.fromObj(d))
    }

    public async getJoiningMembers(page: number) {
        const user = await User.get()
        const members = await user!.post(`/user/referral/code/${this.id}/joined`, { page })
        return members.map((m: any) => Member.fromObj(this.program.community, m))
    }

}