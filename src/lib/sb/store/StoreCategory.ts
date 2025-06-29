import Community from "../Community";
import User from "../User";
import Sku from "./sku/Sku";
import StoreCategorySet from "./StoreCategorySet";

export type StoreCategoryPolicy = 'tiered' | 'exclusive'

export default class StoreCategory {

    community: Community
    id: string
    name: string
    sets: StoreCategorySet[] = []
    skus: Sku[] = []
    policy: StoreCategoryPolicy | null
    visible: boolean
    paused: boolean

    constructor(community: Community, id: string, name: string, policy: StoreCategoryPolicy | null, visible: boolean, paused: boolean, sets: StoreCategorySet[] = [], skus: Sku[] = []) {
        this.community = community
        this.id = id
        this.name = name
        this.sets = sets
        this.skus = skus
        this.policy = policy
        this.visible = visible
        this.paused = paused
    }

    public static fromObj(community: Community, obj: any) {
        const category = new StoreCategory(
            community,
            obj.id,
            obj.name,
            obj.policy,
            obj.visible,
            obj.paused,
            obj.sets.map((s: any) => StoreCategorySet.fromObj(community, s)),
        )
        category.skus = obj.skus.filter((s: any) => s).map((s: any) => Sku.fromObj(category, s)).sort((a:Sku, b:Sku) => a.index - b.index)
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

    public async update(name: string, policy: StoreCategoryPolicy | null, visible: boolean, paused: boolean) {
        const user = await User.get()
        return StoreCategory.fromObj(this.community, await user!.patch(`/community/${this.community.id}/store/category/${this.id}`, {
            name,
            policy,
            visible: visible ? 'true' : 'false',
            paused: paused ? 'true' : 'false',
        }))
    }

    public async delete() {
        const user = await User.get()
        await user!.delete(`/community/${this.community.id}/store/category/${this.id}`)
    }

}