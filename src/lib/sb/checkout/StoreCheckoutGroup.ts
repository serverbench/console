import Member from "../member/Member";
import Discount from "./Discount";
import type StoreCheckout from "./StoreCheckout";
import StoreCheckoutLine from "./StoreCheckoutLine";

export default class StoreCheckoutGroup {

    checkout: StoreCheckout
    owner: Member
    lines: StoreCheckoutLine[]
    discounts: Discount[]

    constructor(checkout: StoreCheckout, owner: Member, lines: StoreCheckoutLine[], discounts: Discount[]) {
        this.checkout = checkout
        this.owner = owner
        this.lines = lines
        this.discounts = discounts
    }

    public static fromObject(checkout: StoreCheckout, obj: any, fallback: Member | null) {
        console.log(obj)
        const group = new StoreCheckoutGroup(
            checkout,
            obj.owner ? Member.fromObj(checkout.community, obj.owner) : fallback!,
            [],
            []
        )
        group.lines = obj.lines.map((line: any) => StoreCheckoutLine.fromObject(group, line))
        group.discounts = obj.discounts.map((discount: any) => Discount.fromObject(checkout.community, discount))
        return group
    }

}