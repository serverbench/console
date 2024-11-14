import type ListingSettings from "./ListingSettings";

export default class VotingStreakSettings {

    settings: ListingSettings
    pass: string

    constructor(settings: ListingSettings, pass: string) {
        this.settings = settings
        this.pass = pass
    }

    public static fromObject(settings: ListingSettings, obj: any) {
        return new VotingStreakSettings(settings, obj.pass)
    }

}