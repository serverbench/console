import Price from "../../../routes/payments/products/category/Price.svelte";
import Sku from "../store/sku/Sku";
import SkuPrice from "../store/sku/SkuPrice";
import StoreCategory from "../store/StoreCategory";
import type StoreCheckoutGroup from "./StoreCheckoutGroup";

export default class StoreCheckoutLine {

    price: SkuPrice
    amount: number
    group: StoreCheckoutGroup

    constructor(price: SkuPrice, amount: number, group: StoreCheckoutGroup) {
        this.price = price
        this.amount = amount
        this.group = group
    }

    public static fromObject(group: StoreCheckoutGroup, obj: any) {
        return new StoreCheckoutLine(
            SkuPrice.fromObj(
                Sku.fromObj(
                    StoreCategory.fromObj(
                        group.checkout.community,
                        obj.price.sku.category
                    ),
                    obj.price.sku
                ),
                obj.price
            ),
            obj.amount,
            group
        )
    }

}