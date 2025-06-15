import Instance from "./Instance"
import Server from "./Server"

export default class InstanceSession {
    public readonly created: Date
    public readonly closed: Date | null
    public readonly id: string
    public readonly instance: Instance

    constructor(instance: Instance, id: string, created: Date, closed: Date | null) {
        this.instance = instance
        this.id = id
        this.created = created
        this.closed = closed
    }
    public static fromObj(instance: Instance | null, obj: any): InstanceSession {
        if (instance === null) {
            instance = Instance.fromObj(
                null,
                obj.instance
            )
        }
        return new InstanceSession(
            instance,
            obj.id,
            new Date(obj.created),
            obj.closed ? new Date(obj.closed) : null
        )
    }
}