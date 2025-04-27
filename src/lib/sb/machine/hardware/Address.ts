export default class Address {
    public readonly ip: string
    public readonly version: string

    constructor(ip: string, version: string) {
        this.ip = ip
        this.version = version
    }

    public static fromObject(obj: any): Address {
        return new Address(
            obj.ip,
            obj.version
        )
    }
}