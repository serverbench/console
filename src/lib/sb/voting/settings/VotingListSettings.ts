import type ListingSettings from "./ListingSettings"

export default class VotingListSettings {
    settings: ListingSettings
    show: number
    fallback: number
    points: number
    wholeGroupPointing: boolean

    constructor(settings: ListingSettings, show: number, fallback: number, points: number, wholeGroupPointing: boolean) {
        this.settings = settings
        this.show = show
        this.fallback = fallback
        this.points = points
        this.wholeGroupPointing = wholeGroupPointing
    }

    public static fromObject(settings: ListingSettings, obj: any) {
        return new VotingListSettings(settings, obj.show, obj.fallback, obj.points, obj.wholeGroupPointing)
    }
}