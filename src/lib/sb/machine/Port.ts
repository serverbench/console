import type Container from "./Container"

export enum Policy {
    DROP = "drop",
    ACCEPT = "accept",
}
export default class Port {

    public readonly container: Container
    public readonly port: number
    public readonly policy: Policy
    public readonly remotes: string[]

    constructor(container: Container, port: number, policy: Policy, remotes: string[]) {
        this.container = container
        this.port = port
        this.policy = policy
        this.remotes = remotes
    }

    public static fromObj(obj: any, container: Container) {
        return new Port(
            container,
            obj.port,
            obj.policy,
            obj.remotes
        )
    }

}