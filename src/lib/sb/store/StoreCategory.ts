import Community from "../Community";
import User from "../User";
import Sku from "./sku/Sku";
import StoreCategorySet from "./StoreCategorySet";

export default class StoreCategory {

    community: Community
    id: string
    name: string
    sets: StoreCategorySet[] = []
    skus: Sku[] = []

    constructor(community: Community, id: string, name: string, sets: StoreCategorySet[] = [], skus: Sku[] = []) {
        this.community = community
        this.id = id
        this.name = name
        this.sets = sets
        this.skus = skus
    }

    public static fromObj(community: Community, obj: any) {
        const category = new StoreCategory(
            community,
            obj.id,
            obj.name,
            obj.sets.map((s: any) => StoreCategorySet.fromObj(community, s)),
        )
        category.skus = obj.skus.map((s: any) => Sku.fromObj(category, s))
        return category
    }

    public static async list(): Promise<StoreCategory[]> {
        const community = await Community.get()
        const user = await User.get()
        const data = await user!.get(`/community/${community!.id}/store/category`)
        return data.map((c: any) => StoreCategory.fromObj(community!, c))
    }

    public static async create(name: string) {
        const community = await Community.get()
        const user = await User.get()
        return StoreCategory.fromObj(community!, await user!.post(`/community/${community!.id}/store/category`, {
            name
        }))
    }

    public async update(name: string) {
        const user = await User.get()
        return StoreCategory.fromObj(this.community, await user!.patch(`/community/${this.community.id}/store/category/${this.id}`, {
            name
        }))
    }

    public async delete() {
        const user = await User.get()
        await user!.delete(`/community/${this.community.id}/store/category/${this.id}`)
    }

}