import type Sku from "./Sku"

export default class SkuPrice {

    sku: Sku
    amount: number
    frequency: 'month' | 'year'
    country: string

    constructor(sku: Sku, amount: number, frequency: 'month' | 'year', country: string) {
        this.sku = sku
        this.amount = amount
        this.frequency = frequency
        this.country = country
    }

    public static fromObj(sku: Sku, obj: any) {
        return new SkuPrice(
            sku,
            obj.amount,
            obj.frequency,
            obj.country
        )
    }

}