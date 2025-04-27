import User from "../User"
import Hardware from "./hardware/Hardware"

export default class Machine {
    public readonly id: string
    public readonly hardware: Hardware | null

    constructor(id: string, hardware: Hardware | null) {
        this.id = id
        this.hardware = hardware
    }
    public static fromObj(obj: any): Machine {
        const hardware = obj.hardware ? Hardware.fromObject(obj.hardware) : null
        return new Machine(obj.id, hardware)
    }

    public static async list(): Promise<Machine[]> {
        return (await (await User.get())!
            .get('/machine')
        ).map((c: any) => Machine.fromObj(c))
    }

    public static async create(): Promise<Machine> {
        const machine = Machine.fromObj(await (await User.get())!.post('/machine'))
        return machine
    }

    public async getKeys(): Promise<{
        sk: string
    }> {
        const { sk } = await (await User.get())!.get(`/machine/${this.id}/keys`)
        return { sk }
    }

    public async resetKeys(): Promise<{
        sk: string
    }> {
        const { sk } = await (await User.get())!.post(`/machine/${this.id}/keys`)
        return { sk }
    }
}