export default class Memory {
    public readonly size:number
    public readonly speed:number
    public readonly type:string

    constructor(size: number, speed: number, type: string) {
        this.size = size
        this.speed = speed
        this.type = type
    }
    public static fromObject(obj: any): Memory {
        return new Memory(
            obj.size,
            obj.speed,
            obj.type
        )
    }
}