import type Currency from "../store/Currency"
import ExchangeRate from "../wallet/ExchangeRate"
import Authorization from "./Authorization"
import type Checkout from "./Checkout"
import Dispute from "./Dispute"
import Refund from "./Refund"
import Subscription from "./Subscription"

export type ChargeType = 'charge' | 'refund' | 'dispute'

export default class Charge extends Authorization {

    subscription: Subscription | null
    netAmount: number
    receivingCurrency: Currency
    disputes: Dispute[]
    refunds: Refund[]
    type: ChargeType
    exchangeRate: ExchangeRate | null

    constructor(service: string, amount: number, currency: Currency, checkout: any, eid: string, id: string, created: Date, subscription: Subscription | null, netAmount: number, receivingCurrency: Currency, disputes: Dispute[], refunds: Refund[], type: ChargeType, exchangeRate: ExchangeRate | null) {
        super(service, amount, currency, checkout, eid, id, created);
        this.subscription = subscription
        this.netAmount = netAmount
        this.receivingCurrency = receivingCurrency
        this.disputes = disputes
        this.refunds = refunds
        this.type = type
        this.exchangeRate = exchangeRate
    }

    public static fromObject(obj: any, checkout: Checkout) {
        const charge = new Charge(
            obj.service,
            obj.amount,
            obj.currency as Currency,
            checkout,
            obj.eid,
            obj.id,
            new Date(obj.created),
            obj.subscription ? Subscription.fromObject(obj.subscription, checkout) : null,
            obj.netAmount,
            obj.receivingCurrency as Currency,
            [],
            [],
            obj.type as ChargeType,
            obj.exchangeRate ? ExchangeRate.fromObject(obj.exchangeRate) : null
        )
        charge.refunds = charge.refunds.map((r: any) => Refund.fromObject(r, charge))
        charge.disputes = charge.disputes.map((d: any) => Dispute.fromObject(d, charge))
        return charge
    }

    public isPositive() {
        return this.amount > 0
    }

}