import type Community from "$lib/sb/Community";

export default class SkuPerk {

    community: Community
    name: string

    constructor(community: Community, name: string) {
        this.community = community
        this.name = name
    }

    public static fromObj(community: Community, obj: any) {
        return new SkuPerk(
            community,
            obj.name
        )
    }

}