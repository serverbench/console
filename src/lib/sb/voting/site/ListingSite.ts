import Community from "../../Community"
import User from "../../User"
import ListingSiteSetup from "./ListingSiteSetup"
import ListingSiteTimings from "./ListingSiteTimings"

export type VotingProtocol = 'NuVotifier'


export default class ListingSite extends ListingSiteTimings {

    id: string
    domain: string
    protocols: Record<VotingProtocol, string>
    owner: User
    verified: Date | null

    constructor(id: string, cooldown: number | null, reset: number | null, tz: string | null, domain: string, protocols: Record<VotingProtocol, string>, owner: User, verified: Date | null) {
        super(cooldown, reset, tz)
        this.id = id
        this.domain = domain
        this.protocols = protocols
        this.owner = owner
        this.verified = verified
    }

    public static fromObject(user: User | null, obj: any): ListingSite {
        return new ListingSite(
            obj.id,
            obj.cooldown,
            obj.reset,
            obj.tz,
            obj.domain,
            obj.protocols,
            user ?? obj.owner,
            obj.verified
        )
    }

    public static async create(domain: string, protocols: Record<VotingProtocol, string | null>, tz: string | null = null, reset: number | null = null, cooldown: number | null = null) {
        const user = await User.get()
        return ListingSite.fromObject(user!, await user!.post(`/user/listing/site`, {
            domain,
            tz,
            reset,
            cooldown,
            protocols: Object.keys(protocols).map((k: string) => {
                if (!protocols[k as VotingProtocol]) return undefined
                return {
                    protocol: k,
                    serviceName: protocols[k as VotingProtocol]
                }
            }).filter(p => p)
        }))
    }

    public async update(domain: string, protocols: Record<VotingProtocol, string | null>, tz: string | null = null, reset: number | null = null, cooldown: number | null = null) {
        const updated = ListingSite.fromObject(this.owner, await this.owner.patch(`/user/listing/site/${this.id}`, {
            domain,
            tz,
            reset,
            cooldown
        }))
        this.domain = updated.domain
        this.tz = updated.tz
        this.reset = updated.reset
        this.cooldown = updated.cooldown
        return this
    }

    public static async listOwned() {
        const user = await User.get();
        return (await user!.get('/user/listing/site')).map((s: any) => ListingSite.fromObject(user!, s))
    }

    public static async listVerified() {
        const user = await User.get();
        return (await user!.get('/public/listing/site')).map((s: any) => ListingSite.fromObject(null, s))
    }

    public async use(url: string, cooldown: number | null, reset: number | null, tz: string | null) {
        const user = await User.get()
        const community = await Community.get()
        return ListingSiteSetup.fromObject(community!, await user!.post(`/community/${community!.id}/listing/site/${this.id}`, {
            url,
            cooldown,
            reset,
            tz
        }))
    }

    public async delete() {
        await this.owner.delete(`/user/listing/site/${this.id}`)
    }

}