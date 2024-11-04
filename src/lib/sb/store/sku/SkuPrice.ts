import User from "$lib/sb/User"
import type Sku from "./Sku"

export type Frequency = 'month' | 'year'

export default class SkuPrice {

    id: string
    sku: Sku
    amount: number
    frequency: Frequency | null
    country: string

    constructor(id: string, sku: Sku, amount: number, frequency: Frequency | null, country: string) {
        this.id = id
        this.sku = sku
        this.amount = amount
        this.frequency = frequency
        this.country = country
    }

    public static fromObj(sku: Sku, obj: any) {
        return new SkuPrice(
            obj.id,
            sku,
            obj.amount,
            obj.frequency,
            obj.country
        )
    }

    public async checkoutPreview() {
        const user = await User.get()
        const obj = await user!.post(`/community/${this.sku.category!.community.id}/store/checkout`, {
            prices: [this.id],
            country: this.country
        })
        return obj
    }

    async delete() {
        const user = await User.get()
        await user!.delete(`/community/${this.sku.category!.community.id}/store/category/${this.sku.category!.id}/sku/${this.sku.id}/price/${this.id}`)
    }

    async update(amount: number, frequency: Frequency | null, country: string | null) {
        const user = await User.get()
        const obj = await user!.patch(`/community/${this.sku.category!.community.id}/store/category/${this.sku.category!.id}/sku/${this.sku.id}/price/${this.id}`, {
            amount: String(amount),
            frequency,
            country
        })
        return SkuPrice.fromObj(this.sku, obj)
    }

}