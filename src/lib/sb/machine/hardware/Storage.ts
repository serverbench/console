export default class Storage {
    public readonly path: string
    public readonly total: number
    public readonly used: number

    constructor(path: string, total: number, used: number) {
        this.path = path
        this.total = total
        this.used = used
    }

    public static fromObject(obj: any): Storage {
        return new Storage(
            obj.path,
            obj.total,
            obj.used
        )
    }
}