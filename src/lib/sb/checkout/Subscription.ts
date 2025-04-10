import type Currency from "../store/Currency";
import type { Frequency } from "../store/sku/SkuPrice";
import Authorization from "./Authorization";
import type Checkout from "./Checkout";

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

}