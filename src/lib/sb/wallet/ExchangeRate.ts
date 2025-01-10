import User from "../User"

export default class ExchangeRate {

    public readonly id: string
    public readonly base: string
    public readonly created: Date
    public readonly rates: Map<string, number>

    constructor(id: string, base: string, created: Date, rates: Map<string, number>) {
        this.id = id
        this.base = base
        this.created = created
        this.rates = rates
    }

    public static fromObject(obj: any) {
        return new ExchangeRate(obj.id, obj.base, obj.created, new Map(Object.entries(obj.rates)))
    }

    public static async get() {
        const user = await User.get()
        return ExchangeRate.fromObject(await user!.get(`/user/exchange/rate`))
    }

}