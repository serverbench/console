import User from "$lib/sb/User";
import type Sku from "../Sku";
import type SkuPerk from "./SkuPerk";

export default class SkuPerkUsage {

    perk: SkuPerk
    sku: Sku
    amount: number | null

    constructor(perk: SkuPerk, sku: Sku, amount: number | null) {
        this.perk = perk
        this.sku = sku
        this.amount = amount
    }

    public static fromObj(perk: SkuPerk, sku: Sku, obj: any) {
        return new SkuPerkUsage(
            perk,
            sku,
            obj.amount
        )
    }

    public async unuse() {
        const user = await User.get()
        await user!.delete(`/community/${this.sku.category!.community.id}/store/category/${this.sku.category!.id}/sku/${this.sku.id}/perk/${this.perk.id}`)
        this.sku.perks = this.sku.perks.filter(p => p.perk.id !== this.perk.id)
    }

    public async update(amount: number | null) {
        const user = await User.get()
        await user!.patch(`/community/${this.sku.category!.community.id}/store/category/${this.sku.category!.id}/sku/${this.sku.id}/perk/${this.perk.id}`, {
            amount
        })
        this.amount = amount
    }

}