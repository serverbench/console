export default class Game {

    slug: string

    constructor(slug: string) {
        this.slug = slug
    }

    public static fromObj(obj: any) {
        return new Game(
            obj.slug
        )
    }

}