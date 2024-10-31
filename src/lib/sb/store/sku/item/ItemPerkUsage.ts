import type ItemPerk from "./ItemPerk";
import type StoreItem from "./StoreItem";

export default class ItemPerkUsage {

    perk: ItemPerk
    item: StoreItem
    amount: number | null

    constructor(perk: ItemPerk, item: StoreItem, amount: number | null) {
        this.perk = perk
        this.item = item
        this.amount = amount
    }

    public static fromObj(perk: ItemPerk, item: StoreItem, obj: any) {
        return new ItemPerkUsage(
            perk,
            item,
            obj.amount
        )
    }

}