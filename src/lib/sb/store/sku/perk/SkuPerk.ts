import Community from "$lib/sb/Community";
import User from "$lib/sb/User";
import Sku from "../Sku";
import PerkCmd, { type CommandTrigger } from "./PerkCmd";
import SkuPerkUsage from "./SkuPerkUsage";

export default class SkuPerk {

    id: string
    community: Community | null
    name: string
    commands: PerkCmd[]

    constructor(community: Community | null, id: string, name: string, commands: PerkCmd[]) {
        this.community = community
        this.id = id
        this.name = name
        this.commands = commands
    }

    public static fromObj(community: Community | null, obj: any) {
        const o = new SkuPerk(
            community,
            obj.id,
            obj.name,
            []
        )
        o.commands = obj.commands.map((c: any) => PerkCmd.fromObj(o, c))
        return o
    }

    public simple() {
        return new SkuPerk(this.community, this.id, this.name, [])
    }

    public static async list() {
        const community = await Community.get()
        const user = await User.get()
        const data = await user!.get(`/community/${community!.id}/store/perk`)
        return data.map((p: any) => SkuPerk.fromObj(community!, p))
    }

    /**
     * list usages. note the resulting usages are just for data display, and do not have the full perk object
     */
    public async listUsages(): Promise<SkuPerkUsage[]> {
        const user = await User.get()
        const data = await user!.get(`/community/${this.community!.id}/store/perk/${this.id}/usages`)
        return data.map((p: any) => SkuPerkUsage.fromObj(this, Sku.fromObj(null, p.sku), p))
    }

    public async delete() {
        const user = await User.get()
        await user!.delete(`/community/${this.community!.id}/store/perk/${this.id}`)
    }

    public async addCommand(trigger: CommandTrigger, cmd: string) {
        const user = await User.get()
        const data = await user!.post(`/community/${this.community!.id}/store/perk/${this.id}/cmd`, {
            trigger,
            cmd
        })
        const cmdObj = PerkCmd.fromObj(this, data)
        this.commands.push(cmdObj)
        return cmdObj
    }



}