export default class Memory {
    public readonly memory:number
    public readonly speed:number
    public readonly type:string

    constructor(memory: number, speed: number, type: string) {
        this.memory = memory
        this.speed = speed
        this.type = type
    }
    public static fromObject(obj: any): Memory {
        return new Memory(
            obj.memory,
            obj.speed,
            obj.type
        )
    }
}