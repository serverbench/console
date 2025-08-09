import type ChatMessage from "./ChatMessage"

export default class Toxicity {
    public readonly instant: number | null
    public readonly instantProfanity: number | null
    public readonly average: number | null
    public readonly averageProfanity: number | null

    constructor(instant: number | null, instantProfanity: number | null, average: number | null, averageProfanity: number | null) {
        this.instant = instant
        this.instantProfanity = instantProfanity
        this.average = average
        this.averageProfanity = averageProfanity
    }

    public static fromObj(obj: any): Toxicity {
        return new Toxicity(
            obj.instant,
            obj.instantProfanity,
            obj.average,
            obj.averageProfanity,
        )
    }
}