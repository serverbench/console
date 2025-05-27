import User from "$lib/sb/User"
import type StoreCategory from "../StoreCategory"
import SkuPerk from "./perk/SkuPerk"
import SkuPerkUsage from "./perk/SkuPerkUsage"
import SkuPrice, { type Frequency } from "./SkuPrice"

export type SkuType = 'item' | 'bundle'

export default class Sku {

    id: string
    category: StoreCategory | null
    name: string
    type: SkuType
    prices: SkuPrice[]
    img: string | null
    perks: SkuPerkUsage[]
    index: number

    constructor(id: string, category: StoreCategory | null, name: string, type: SkuType, img: string | null, prices: SkuPrice[] = [], perks: SkuPerkUsage[] = [], index: number) {
        this.id = id
        this.category = category
        this.name = name
        this.type = type
        this.prices = prices
        this.img = img
        this.perks = perks
        this.index = index
    }

    public static fromObj(category: StoreCategory | null, obj: any) {
        console.log(obj)
        const item = new Sku(
            obj.id,
            category,
            obj.name,
            obj.type,
            obj.img,
            [],
            [],
            obj.index
        )
        item.prices = obj.prices.filter((p: any) => p != null).map((p: any) => SkuPrice.fromObj(item, p))
        if (category) {
            try {
                item.perks = obj.perks.map((p: any) => SkuPerkUsage.fromObj(SkuPerk.fromObj(category?.community ?? null, p.perk), item, p))
            } catch (error) {
                // perks might be empty
            }
        }
        return item
    }

    public async addPricing(amount: number, frequency: Frequency | null, country: string | null) {
        const user = await User.get()
        const obj = await user!.post(`/community/${this.category!.community.id}/store/category/${this.category!.id}/sku/${this.id}/price`, {
            amount: String(amount),
            country,
            frequency
        })
        const price = SkuPrice.fromObj(this, obj)
        this.prices.push(price)
        return price
    }

    public static async fromId(category: StoreCategory, id: string) {
        const user = await User.get()
        return Sku.fromObj(category, await user!.get(`/community/${category.community.id}/store/category/${category.id}/sku/${id}`))
    }

    public static async create(category: StoreCategory, type: SkuType, name: string, amount: number, frequency: 'month' | 'year' | null) {
        const user = await User.get()
        const item = Sku.fromObj(category, await user!.post(`/community/${category.community.id}/store/category/${category.id}/sku`, {
            name,
            type,
            amount: String(amount),
            frequency
        }))
        category.skus.push(item)
        return item
    }

    public async remove() {
        const user = await User.get()
        return user!.delete(`/community/${this.category!.community.id}/store/category/${this.category!.id}/sku/${this.id}`)
    }

    public async createPerk(name: string, amount: number | null = null) {
        const user = await User.get()
        const obj = await user!.post(`/community/${this.category!.community.id}/store/category/${this.category!.id}/sku/${this.id}/perk`, {
            name,
            amount: amount ? String(amount) : null
        })
        const perk = SkuPerk.fromObj(this.category!.community, obj.perk)
        const perkUsage = SkuPerkUsage.fromObj(perk, this, obj)
        this.perks = [perkUsage, ...this.perks]
        return perkUsage
    }

    public async addPerk(perk: SkuPerk, amount: number | null = null) {
        const user = await User.get()
        const obj = await user!.post(`/community/${this.category!.community.id}/store/category/${this.category!.id}/sku/${this.id}/perk/${perk.id}`, {
            amount: amount ? String(amount) : null
        })
        const perkUsage = SkuPerkUsage.fromObj(perk, this, obj)
        this.perks = [perkUsage, ...this.perks]
        return perkUsage
    }

}