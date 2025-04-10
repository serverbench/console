import type Currency from "../store/Currency";
import type { Frequency } from "../store/sku/SkuPrice";
import type User from "../User";
import CheckoutGateway from "./CheckoutGateway";
import type StoreCheckout from "./StoreCheckout";

export default class Checkout {
    store: StoreCheckout
    user: User | null
    email: string
    token: string
    test: boolean
    country: string | null
    upfront: number
    currency: Currency
    recurrent: number
    frequency: Frequency | null
    trialDays: number | null
    cycles: number | null
    gateways: CheckoutGateway[]
    completed: Date | null

    constructor(store: StoreCheckout, user: User | null, email: string, token: string, test: boolean, country: string | null, upfront: number, currency: Currency, recurrent: number, frequency: Frequency | null, trialDays: number | null, cycles: number | null, gateways: CheckoutGateway[], completed: Date | null) {
        this.store = store
        this.user = user
        this.email = email
        this.token = token
        this.test = test
        this.country = country
        this.upfront = upfront
        this.currency = currency
        this.recurrent = recurrent
        this.frequency = frequency
        this.trialDays = trialDays
        this.cycles = cycles
        this.gateways = gateways
        this.completed = completed
    }
    public static fromObject(store: StoreCheckout, obj: any) {
        const checkout = new Checkout(
            store,
            null,
            obj.email,
            obj.token,
            obj.test,
            obj.country,
            obj.upfront,
            obj.currency as Currency,
            obj.recurrent,
            obj.frequency,
            obj.trialDays,
            obj.cycles,
            [],
            null
        )
        checkout.gateways = obj.gateways.map((gateway: any) => {
            return CheckoutGateway.fromObject(gateway, checkout)
        })
        return checkout
    }

}