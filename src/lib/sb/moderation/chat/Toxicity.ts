import type ChatMessage from "./ChatMessage"

export default class Toxicity {
    public readonly instant: number
    public readonly instantProfanity: number
    public readonly average: number
    public readonly averageProfanity: number

    constructor(instant: number, instantProfanity: number, average: number, averageProfanity: number) {
        this.instant = instant
        this.instantProfanity = instantProfanity
        this.average = average
        this.averageProfanity = averageProfanity
    }

    public static fromObj(obj: any): Toxicity {
        return new Toxicity(
            obj.instant || 0,
            obj.instantProfanity || 0,
            obj.average || 0,
            obj.averageProfanity || 0,
        )
    }
}