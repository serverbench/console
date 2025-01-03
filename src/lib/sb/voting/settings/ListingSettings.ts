import Community from "$lib/sb/Community";
import User from "$lib/sb/User";
import VotingListSettings from "./VotingListSettings";

export default class ListingSettings {
    community: Community
    primary?: VotingListSettings
    secondary?: VotingListSettings
    period: number

    constructor(community: Community, period: number, primary?: VotingListSettings, secondary?: VotingListSettings) {
        this.community = community
        this.primary = primary
        this.secondary = secondary
        this.period = period
    }

    public static fromObject(community: Community, obj: any) {
        const settings = new ListingSettings(community, obj.period)
        settings.primary = VotingListSettings.fromObject(settings, 'primary', obj.primary)
        settings.secondary = VotingListSettings.fromObject(settings, 'secondary', obj.secondary)
        return settings
    }

    public static async get() {
        const user = await User.get()
        const community = await Community.get()
        return ListingSettings.fromObject(community!, await user!.get(`/community/${community!.id}/listing/settings`))
    }
}