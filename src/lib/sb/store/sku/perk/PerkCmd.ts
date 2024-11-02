import User from "$lib/sb/User";
import type SkuPerk from "./SkuPerk";

export type CommandTrigger = 'acquire' | 'renew' | 'terminated'

export default class PerkCmd {

    id: string
    trigger: CommandTrigger
    perk: SkuPerk
    cmd: string

    constructor(perk: SkuPerk, id: string, trigger: CommandTrigger, cmd: string) {
        this.perk = perk
        this.id = id
        this.trigger = trigger
        this.cmd = cmd
    }

    public static fromObj(perk: SkuPerk, obj: any) {
        return new PerkCmd(
            perk,
            obj.id,
            obj.trigger,
            obj.cmd
        )
    }

    public async update(trigger: CommandTrigger, cmd: string) {
        const user = await User.get()
        await user!.patch(`/community/${this.perk.community!.id}/store/perk/${this.perk.id}/cmd/${this.id}`, {
            trigger,
            cmd
        })
        this.trigger = trigger
        this.cmd = cmd
        return this
    }

    public async remove() {
        const user = await User.get()
        await user!.delete(`/community/${this.perk.community!.id}/store/perk/${this.perk.id}/cmd/${this.id}`)
        this.perk.commands = this.perk.commands.filter(c => c.id !== this.id)
    }

}