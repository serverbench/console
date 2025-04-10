import type Community from "../Community";
import Member from "../member/Member";
import Checkout from "./Checkout";
import Discount from "./Discount";
import StoreCheckoutGroup from "./StoreCheckoutGroup";

export default class StoreCheckout {

    id: string
    created: Date
    community: Community
    groups: StoreCheckoutGroup[]
    checkout: Checkout | null
    member: Member | null
    discounts: Discount[]

    constructor(community: Community, id:string, created:Date, groups: StoreCheckoutGroup[], checkout: Checkout | null, member: Member | null, discounts: Discount[]) {
        this.id = id
        this.created = created
        this.community = community
        this.groups = groups
        this.checkout = checkout
        this.member = member
        this.discounts = discounts
    }

    public static fromObject(community: Community, obj: any) {
        const checkout = new StoreCheckout(
            community,
            obj.id,
            new Date(obj.created),
            [],
            null,
            obj.member ? Member.fromObj(community, obj.member) : null,
            obj.discounts.map((discount: any) => Discount.fromObject(community, discount))
        )
        checkout.checkout = Checkout.fromObject(checkout, obj.checkout)
        checkout.groups = obj.groups.map((group: any) => StoreCheckoutGroup.fromObject(checkout, group, checkout.member))
        return checkout
    }

}