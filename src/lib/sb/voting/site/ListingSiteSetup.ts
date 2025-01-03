import Community from "../../Community";
import User from "../../User";
import type ListingSite from "./ListingSite";
import ListingSiteTimings from "./ListingSiteTimings";

export default class ListingSiteSetup extends ListingSiteTimings {

    community: Community
    site: ListingSite
    url: string
    featured: boolean | null
    discriminator: string | null

    constructor(cooldown: number | null, reset: number | null, tz: string | null, community: Community, site: ListingSite, url: string, featured: boolean | null, discriminator: string | null) {
        super(cooldown, reset, tz)
        this.community = community
        this.site = site
        this.url = url
        this.featured = featured
        this.discriminator = discriminator
    }

    public static fromObject(community: Community, obj: any) {
        return new ListingSiteSetup(
            obj.cooldown,
            obj.reset,
            obj.tz,
            community,
            obj.site,
            obj.url,
            obj.featured,
            obj.discriminator
        )
    }

    public static async list() {
        const user = await User.get()
        const community = await Community.get();
        return (await user!.get(`/community/${community!.id}/listing/site`)).map((s: any) => ListingSiteSetup.fromObject(community!, s))
    }

    async update(url: string, cooldown: number | null, reset: number | null, tz: string | null = null) {
        const user = await User.get()
        const updated = ListingSiteSetup.fromObject(this.community, await user!.patch(`/community/${this.community.id}/listing/site/${this.site.id}`, {
            url,
            cooldown,
            reset,
            tz
        }))
        this.url = updated.url
        this.cooldown = updated.cooldown
        this.reset = updated.reset
        this.tz = updated.tz
        return this
    }

    async delete() {
        const user = await User.get()
        await user!.delete(`/community/${this.community.id}/listing/site/${this.site.id}`)
    }

}