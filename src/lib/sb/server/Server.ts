import Community from "../Community"
import User from "../User"

export default class Server {

    public readonly id: string
    public readonly slug: string
    public readonly instanceCount: number

    constructor(id: string, slug: string, instanceCount: number) {
        this.id = id
        this.slug = slug
        this.instanceCount = instanceCount
    }

    public static fromObj(obj: any) {
        return new Server(
            obj.id,
            obj.slug,
            obj.instanceCount
        )
    }

    public static async list() {
        const community = await Community.get()
        const user = await User.get()
        return (await user!.get(`/community/${community!.id}/server`)).map((s: any) => Server.fromObj(s))
    }

    public static async create(slug: string) {
        const community = await Community.get()
        const user = await User.get()
        return Server.fromObj(await user!.post(`/community/${community!.id}/server`, {
            slug
        }))
    }

    public async remove() {
        const community = await Community.get()
        const user = await User.get()
        await user!.delete(`/community/${community!.id}/server/${this.id}`)
    }


}