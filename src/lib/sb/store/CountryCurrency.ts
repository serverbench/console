import Community from "../Community";
import User from "../User";

export default class CountryCurrency {

    community: Community
    country: string | null
    currency: string
    digits: number

    constructor(community: Community, country: string | null, currency: string, digits: number) {
        this.community = community
        this.country = country
        this.currency = currency
        this.digits = digits
    }

    public static fromObj(community: Community, obj: any) {
        return new CountryCurrency(community, obj.country, obj.currency, obj.digits)
    }

    public static async list() {
        const community = await Community.get()
        const user = await User.get()
        const data = await user!.get(`/community/${community!.id}/store/currency`)
        return data.map((d: any) => CountryCurrency.fromObj(community!, d))
    }

    public async remove() {
        const user = await User.get()
        await user!.delete(`/community/${this.community.id}/store/currency/${this.country}`)
    }

    public async update(currency: string) {
        const updated = await CountryCurrency.set(this.country, currency, this.community)
        this.currency = updated.currency
        return this
    }

    public static async set(country: string | null, currency: string, _cc?: Community) {
        const community = _cc ?? await Community.get()
        const user = await User.get()
        return CountryCurrency.fromObj(
            community!,
            await user!.post(`/community/${community!.id}/store/currency`,
                { country, currency }
            )
        )
    }

}