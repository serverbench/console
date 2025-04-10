import type Checkout from "./Checkout"

export default class CheckoutGateway {
    service: string
    checkout: Checkout
    initialized: Date | null

    constructor(service: string, checkout: Checkout, initialized: Date | null) {
        this.service = service
        this.checkout = checkout
        this.initialized = initialized
    }

    public static fromObject(obj: any, checkout: Checkout) {
        return new CheckoutGateway(
            obj.service,
            checkout,
            obj.initialized ? new Date(obj.initialized) : null
        )
    }

}