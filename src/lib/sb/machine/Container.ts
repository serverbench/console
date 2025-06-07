import type Instance from "../server/Instance"
import Port from "./Port"

export default class Container {
    public readonly id: string
    public readonly instance: Instance
    public readonly image: string
    public readonly envs: Record<string, string>
    public readonly address: string
    private _ports: Port[]
    public readonly cpus: number | null
    public readonly memory: number | null
    public readonly locked: Date | null
    public readonly deleted: Date | null

    constructor(
        id: string,
        instance: Instance,
        image: string,
        envs: Record<string, string>,
        address: string,
        ports: Port[],
        cpus: number | null,
        memory: number | null,
        locked: Date | null,
        deleted: Date | null
    ) {
        this.id = id
        this.instance = instance
        this.image = image
        this.envs = envs
        this.address = address
        this._ports = ports
        this.cpus = cpus
        this.memory = memory
        this.locked = locked
        this.deleted = deleted
    }

    public static fromObj(obj: any, instance: Instance) {
        const c = new Container(
            obj.id,
            instance,
            obj.image,
            obj.envs || {},
            obj.address,
            [],
            obj.cpus || null,
            obj.memory || null,
            obj.locked ? new Date(obj.locked) : null,
            obj.deleted ? new Date(obj.deleted) : null
        )
        c._ports = obj.ports.map((p: any) => Port.fromObj(p, c))
        return c
    }

    public get ports() {
        return this._ports
    }

}