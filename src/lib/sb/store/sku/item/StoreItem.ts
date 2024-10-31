import User from "$lib/sb/User";
import type StoreCategory from "../../StoreCategory";
import Sku from "../Sku";
import SkuPrice from "../SkuPrice";
import ItemPerk from "./ItemPerk";
import ItemPerkUsage from "./ItemPerkUsage";

export default class StoreItem extends Sku {

    perks: ItemPerkUsage[]

    constructor(id: string, category: StoreCategory, name: string, img: string | null, perks: ItemPerkUsage[] = []) {
        super(id, category, name, 'item', img)
        this.perks = perks
    }

    public static fromObj(category: StoreCategory, obj: any) {
        const item = new StoreItem(
            obj.id,
            category,
            obj.name,
            obj.img
        )
        item.prices = obj.prices.map((p: any) => SkuPrice.fromObj(item, p))
        item.perks = obj.perks.map((p: any) => ItemPerkUsage.fromObj(ItemPerk.fromObj(category.community, p.perk), item, p))
        return item
    }

    public static async create(category: StoreCategory, name: string, amount: number, frequency: 'month' | 'year' | null) {
        const user = await User.get()
        const item = await StoreItem.fromObj(category, await user!.post(`/community/${category.community.id}/store/category/${category.id}/item`, {
            name,
            amount: String(amount),
            frequency
        }))
        category.skus.push(item)
        return item
    }

    public async remove() {
        const user = await User.get()
        return user!.delete(`/community/${this.category.community.id}/store/category/${this.category.id}/item/${this.id}`)
    }

}