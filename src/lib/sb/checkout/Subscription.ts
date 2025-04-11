import Community from "../Community";
import type Currency from "../store/Currency";
import type { Frequency } from "../store/sku/SkuPrice";
import User from "../User";
import Authorization from "./Authorization";
import Checkout from "./Checkout";
import StoreCheckout from "./StoreCheckout";

export default class Subscription extends Authorization {

    frequency: Frequency
    finished: Date | null
    cycle: number | null

    constructor(service: string, amount: number, currency: Currency, checkout: any, eid: string, id: string, created: Date, frequency: Frequency, finished: Date | null, cycle: number | null) {
        super(service, amount, currency, checkout, eid, id, created);
        this.frequency = frequency;
        this.finished = finished;
        this.cycle = cycle;
    }

    public static fromObject(obj: any, checkout: Checkout) {
        return new Subscription(
            obj.service,
            obj.amount,
            obj.currency as Currency,
            checkout,
            obj.eid,
            obj.id,
            new Date(obj.created),
            obj.frequency,
            obj.finished ? new Date(obj.finished) : null,
            obj.cycle
        )
    }

    public static async list(page: number = 0) {
        const user = await User.get()
        const community = await Community.get()
        return (await user!.post(`/community/${community?.id}/subscription`, {
            page
        })).map((s: any) => {
            s.checkout.store.checkout = s.checkout
            const storeCheckout = StoreCheckout.fromObject(community!, s.checkout.store)
            return Subscription.fromObject(s, storeCheckout.checkout!)
        })
    }

    public async end(instantly: boolean) {
        const user = await User.get()
        const community = await Community.get()
        await user!.post(`/community/${community?.id}/subscription/${this.id}/end`, {
            instantly
        })
    }

}