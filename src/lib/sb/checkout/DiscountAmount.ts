import type Discount from "./Discount";

export default class DiscountAmount {

    discount: Discount
    country: string | null
    amount: number
    percentage: number

    constructor(discount: Discount, country: string | null, amount: number, percentage: number) {
        this.discount = discount
        this.country = country
        this.amount = amount
        this.percentage = percentage
    }

    public static fromObject(discount: Discount, obj: any) {
        return new DiscountAmount(
            discount,
            obj.country,
            obj.amount,
            obj.percentage
        )
    }

}