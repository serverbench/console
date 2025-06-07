import Container from "../machine/Container"
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

    public static fromObj(server: Server, obj: any) {
        const i = new Instance(
            server,
            obj.id,
            obj.name,
            []
        )
        i._containers = obj.containers.map((c: any) => Container.fromObj(c, i))
        return i
    }
}