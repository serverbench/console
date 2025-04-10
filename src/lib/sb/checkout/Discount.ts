import type Community from "../Community";
import DiscountAmount from "./DiscountAmount";

export type DiscountType = 'sale' | 'upgrade' | 'code'

export default class Discount {

    community: Community
    type: DiscountType
    recurrent: boolean
    amounts: DiscountAmount[]

    constructor(community: Community, type: DiscountType, recurrent: boolean, amounts: DiscountAmount[]) {
        this.community = community
        this.type = type
        this.recurrent = recurrent
        this.amounts = amounts
    }

    public static fromObject(community: Community, obj: any) {
        const discount = new Discount(
            community,
            obj.type,
            obj.recurrent,
            []
        )
        discount.amounts = obj.amounts.map((amount: any) => DiscountAmount.fromObject(discount, amount))
        return discount
    }


}