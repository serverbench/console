import Community from "../Community"
import User from "../User"
import type StoreCategory from "./StoreCategory"

export default class StoreCategorySet {

    community: Community
    id: string
    name: string

    constructor(community: Community, id: string, name: string) {
        this.community = community
        this.id = id
        this.name = name
    }

    public static fromObj(community: Community, obj: any) {
        return new StoreCategorySet(
            community,
            obj.id,
            obj.name
        )
    }

    public static async create(name: string, category: StoreCategory): Promise<StoreCategorySet> {
        const community = await Community.get()
        const user = await User.get()
        const data = await user!.post(`/community/${community!.id}/store/category/${category.id}/set`, {
            name
        })
        return StoreCategorySet.fromObj(community!, data)
    }

    public async useSet(category: StoreCategory) {
        const community = await Community.get()
        const user = await User.get()
        await user!.post(`/community/${community!.id}/store/category/${category.id}/set/${this.id}`)
        category.sets.push(this)
        return category
    }

    public async unuseSet(category: StoreCategory) {
        const community = await Community.get()
        const user = await User.get()
        await user!.delete(`/community/${community!.id}/store/category/${category.id}/set/${this.id}`)
        category.sets = category.sets.filter(s => s.id !== this.id)
        return category
    }

    public static async list(): Promise<StoreCategorySet[]> {
        const community = await Community.get()
        const user = await User.get()
        const data = await user!.get(`/community/${community!.id}/store/category-set`)
        return data.map((c: any) => StoreCategorySet.fromObj(community!, c))
    }

    public async remove() {
        const user = await User.get()
        return await user!.delete(`/community/${this.community.id}/store/category-set/${this.id}`)
    }

}