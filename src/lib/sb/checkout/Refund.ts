import type Charge from "./Charge"

export default class Refund {

    eid: string
    amount: number
    charge: Charge

    constructor(eid: string, amount: number, charge: Charge) {
        this.eid = eid
        this.amount = amount
        this.charge = charge
    }

    public static fromObject(obj: any, charge: Charge) {
        return new Refund(
            obj.eid,
            obj.amount,
            charge
        )
    }

}