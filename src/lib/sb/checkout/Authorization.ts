import type Currency from "../store/Currency"
import type Checkout from "./Checkout"

export default abstract class Authorization {
    service: string
    amount: number
    currency: Currency
    checkout: Checkout
    eid: string
    id: string
    created: Date

    constructor(service: string, amount: number, currency: Currency, checkout: Checkout, eid: string, id: string, created: Date) {
        this.service = service
        this.amount = amount
        this.currency = currency
        this.checkout = checkout
        this.eid = eid
        this.id = id
        this.created = created
    }
}