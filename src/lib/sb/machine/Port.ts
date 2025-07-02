import type Container from "./Container"
import type { Policy } from "./IPort"
import type IPort from "./IPort"

export default class Port implements IPort {

    public readonly container: Container
    public readonly name: string
    public readonly port: number
    public readonly policy: Policy
    public readonly remotes: string[]

    constructor(container: Container, name: string, port: number, policy: Policy, remotes: string[]) {
        this.name = name
        this.container = container
        this.port = port
        this.policy = policy
        this.remotes = remotes
    }

    public static fromObj(obj: any, container: Container) {
        return new Port(
            container,
            obj.name,
            obj.port,
            obj.policy,
            obj.remotes
        )
    }

    public asObject(): IPort {
        return {
            name: this.name,
            port: this.port,
            policy: this.policy,
            remotes: this.remotes
        }
    }

}