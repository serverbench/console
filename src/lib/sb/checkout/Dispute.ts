import type Charge from "./Charge"

export default class Dispute {

    eid: string
    charge: Charge
    closed: Date | null

    constructor(eid: string, charge: Charge, closed: Date | null) {
        this.eid = eid
        this.charge = charge
        this.closed = closed
    }

    public static fromObject(obj: any, charge: Charge) {
        return new Dispute(
            obj.eid,
            charge,
            obj.closed ? new Date(obj.closed) : null
        )
    }

}