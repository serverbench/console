import type Repository from "../ci/Repository"
import Community from "../Community"
import Container from "../machine/Container"
import type IPort from "../machine/IPort"
import type Machine from "../machine/Machine"
import User from "../User"
import Server from "./Server"

export default class Instance {
    public readonly server: Server
    public readonly id: string
    public readonly name: string | null
    private _containers: Container[]

    constructor(server: Server, id: string, name: string | null, containers: Container[]) {
        this.server = server
        this.id = id
        this.name = name
        this._containers = containers
    }

    public get containers() {
        return this._containers
    }

    public static fromObj(server: Server | null, obj: any) {
        if (server === null) {
            server = Server.fromObj(
                obj.server
            )
        }
        const i = new Instance(
            server,
            obj.id,
            obj.name,
            []
        )
        i._containers = obj.containers.map((c: any) => Container.fromObj(c, i))
        return i
    }

    public async host(machine: Machine, image: string, mount: string, address: string, memory: number | null, cpus: number | null, ports: IPort[], envs: Record<string, string>, repository: Repository | null, branch: string | null): Promise<Container> {
        const user = await User.get()
        const community = await Community.get()
        const sk = (await machine.getKeys()).sk
        const d = await user!.post(`/community/${community!.id}/server/${this.server.id}/instance/${this.id}/host`, {
            machineSk: sk,
            image,
            mount,
            address,
            envs,
            ports,
            cpus: cpus ?? undefined,
            memory: memory ?? undefined,
            repository: repository?.id ?? undefined,
            branch: branch ?? undefined
        })
        const container = Container.fromObj(d, this)
        this._containers.push(container)
        return container
    }
}