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

}