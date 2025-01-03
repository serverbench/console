import User from "$lib/sb/User"
import type ListingSettings from "./ListingSettings"

export default class VotingListSettings {
    group: string
    settings: ListingSettings
    show: number
    fallback: number

    constructor(settings: ListingSettings, group: string, show: number, fallback: number, points: number, wholeGroupPointing: boolean) {
        this.settings = settings
        this.group = group
        this.show = show
        this.fallback = fallback
    }

    public static fromObject(settings: ListingSettings, group: string, obj: any) {
        return new VotingListSettings(settings, group, obj.show, obj.fallback, obj.points, obj.wholeGroupPointing)
    }

    public async update(show: number, fallback: number) {
        const user = await User.get()
        await user!.patch(`/community/${this.settings.community.id}/listing/settings/list/${this.group}`, {
            show,
            fallback,
        })
    }
}