import type StoreCategory from "../StoreCategory";
import Sku from "./Sku";

export default class StoreBundle extends Sku {

    constructor(id:string, category: StoreCategory, name: string, img: string | null) {
        super(id, category, name, 'bundle', img)
    }

    public static fromObj(category: StoreCategory, obj: any) {
        return new StoreBundle(
            obj.id,
            category,
            obj.name,
            obj.img
        )
    }

}