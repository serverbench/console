import Charge from "../checkout/Charge"
import StoreCheckout from "../checkout/StoreCheckout"
import Community from "../Community"
import User from "../User"

export default class Transaction {

    result: Charge | null
    checkout: StoreCheckout

    constructor(result: Charge | null, checkout: StoreCheckout) {
        this.result = result
        this.checkout = checkout
    }

    public static fromObject(community: Community, obj: any) {
        const storeCheckout = StoreCheckout.fromObject(community, obj.checkout)
        const t = new Transaction(obj.result != null ? Charge.fromObject(obj.result, storeCheckout.checkout!) : null, storeCheckout)
        return t
    }

    public static async list(page = 0) {
        const community = await Community.get()
        const user = await User.get()
        const data = await user!.post(`/community/${community!.id}/store/transactions`, {
            page
        })
        return data.map((c: any) => Transaction.fromObject(community!, c))
    }

}