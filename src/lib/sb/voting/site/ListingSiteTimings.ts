export default abstract class ListingSiteTimings {

    cooldown: number | null
    reset: number | null
    tz: string | null

    constructor(cooldown: number | null, reset: number | null, tz: string | null) {
        this.cooldown = cooldown
        this.reset = reset
        this.tz = tz
    }


}