import type StoreCategory from "../StoreCategory"
import type SkuPrice from "./SkuPrice"

export default abstract class Sku {

    id: string
    category: StoreCategory
    name: string
    type: 'item' | 'bundle'
    prices: SkuPrice[]
    img: string | null

    constructor(id: string, category: StoreCategory, name: string, type: 'item' | 'bundle', img: string | null, prices: SkuPrice[] = []) {
        this.id = id
        this.category = category
        this.name = name
        this.type = type
        this.prices = prices
        this.img = img
    }

}