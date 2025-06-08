export enum Policy {
    DROP = "DROP",
    ACCEPT = "ACCEPT",
}

export default interface IPort {
    name: string
    port: number
    policy: string
    remotes: string[]
}