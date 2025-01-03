import User from "../User"
import ReferralProgram from "./ReferralProgram"

export default class ReferralCode {

    program: ReferralProgram
    code: string

    constructor(program: ReferralProgram, code: string) {
        this.program = program
        this.code = code
    }

    public static fromObj(obj: any) {
        return new ReferralCode(ReferralProgram.fromObj(obj.program), obj.code)
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

}