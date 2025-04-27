import Address from "./Address"

export default class Interface {
    public readonly speed: number
    public readonly name: string
    public readonly bandwidth: number
    public readonly addresses: Address[]

    constructor(speed: number, name: string, bandwidth: number, addresses: Address[]) {
        this.speed = speed
        this.name = name
        this.bandwidth = bandwidth
        this.addresses = addresses
    }
    public static fromObject(obj: any): Interface {
        return new Interface(
            obj.speed,
            obj.name,
            obj.bandwidth,
            obj.addresses.map((address: any) => Address.fromObject(address))
        )
    }

}