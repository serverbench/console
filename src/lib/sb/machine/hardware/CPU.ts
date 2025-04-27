export default class CPU {

    public readonly name: string
    public readonly vendor: string
    public readonly cores: number
    public readonly frequency: number
    public readonly path: string

    constructor(name: string, vendor: string, cores: number, frequency: number, path: string) {
        this.name = name
        this.vendor = vendor
        this.cores = cores
        this.frequency = frequency
        this.path = path
    }
    public static fromObject(obj: any): CPU {
        return new CPU(
            obj.name,
            obj.vendor,
            obj.cores,
            obj.frequency,
            obj.path
        )
    }

}