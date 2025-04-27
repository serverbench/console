import CPU from "./CPU";
import Interface from "./Interface";
import Memory from "./Memory";
import Storage from "./Storage";

export default class Hardware {
    public readonly cpus: CPU[]
    public readonly memory: Memory
    public readonly storage: Storage
    public readonly interfaces: Interface[]
    public readonly hostname: string

    constructor(cpus: CPU[], memory: Memory, storage: Storage, interfaces: Interface[], hostname: string) {
        this.cpus = cpus
        this.memory = memory
        this.storage = storage
        this.interfaces = interfaces
        this.hostname = hostname
    }
    public static fromObject(obj: any): Hardware {
        return new Hardware(
            obj.cpus.map((cpu: any) => CPU.fromObject(cpu)),
            Memory.fromObject(obj.memory),
            Storage.fromObject(obj.storage),
            obj.interfaces.map((iface: any) => Interface.fromObject(iface)),
            obj.hostname
        )
    }
}