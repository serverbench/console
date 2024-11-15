import Community from "$lib/sb/Community";
import User from "$lib/sb/User";
import VotingListSettings from "./VotingListSettings";
import VotingRankingSettings from "./VotingRankingSettings";
import VotingStreakSettings from "./VotingStreakSettings";

export default class ListingSettings {
    community: Community
    ranking?: VotingRankingSettings
    streak?: VotingStreakSettings
    primary?: VotingListSettings
    secondary?: VotingListSettings
    period: number

    constructor(community: Community, period: number, ranking?: VotingRankingSettings, streak?: VotingStreakSettings, primary?: VotingListSettings, secondary?: VotingListSettings) {
        this.community = community
        this.ranking = ranking
        this.streak = streak
        this.primary = primary
        this.secondary = secondary
        this.period = period
    }

    public static fromObject(community: Community, obj: any) {
        const settings = new ListingSettings(community, obj.period)
        settings.ranking = VotingRankingSettings.fromObject(settings, obj.ranking)
        settings.streak = VotingStreakSettings.fromObject(settings, obj.streak)
        settings.primary = VotingListSettings.fromObject(settings, obj.primary)
        settings.secondary = VotingListSettings.fromObject(settings, obj.secondary)
        return settings
    }

    public static async get() {
        const user = await User.get()
        const community = await Community.get()
        return ListingSettings.fromObject(community!, await user!.get(`/community/${community!.id}/listing/settings`))
    }
}