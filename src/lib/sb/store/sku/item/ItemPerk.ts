import type Community from "$lib/sb/Community";

export default class ItemPerk {

    community: Community
    name: string

    constructor(community: Community, name: string) {
        this.community = community
        this.name = name
    }

    public static fromObj(community: Community, obj: any) {
        return new ItemPerk(
            community,
            obj.name
        )
    }

}