import type ListingSettings from "./ListingSettings";

export default class VotingRankingSettings {

    settings: ListingSettings
    rankupPoints: string
    decreaseAfter: number
    decreaseAmount: number

    constructor(settings: ListingSettings, rankupPoints: string, decreaseAfter: number, decreaseAmount: number) {
        this.settings = settings
        this.rankupPoints = rankupPoints
        this.decreaseAfter = decreaseAfter
        this.decreaseAmount = decreaseAmount
    }

    public static fromObject(settings: ListingSettings, obj: any) {
        return new VotingRankingSettings(settings, obj.rankupPoints, obj.decreaseAfter, obj.decreaseAmount)
    }

}