import Community from "../Community";
import User from "../User";
import SiteTimings from "./SiteTimings";
import type VotingSite from "./VotingSite";

export default class SiteSetup extends SiteTimings {

    community: Community
    site: VotingSite
    url: string
    featured: boolean | null

    constructor(cooldown: number | null, reset: number | null, tz: string | null, community: Community, site: VotingSite, url: string, featured: boolean | null) {
        super(cooldown, reset, tz)
        this.community = community
        this.site = site
        this.url = url
        this.featured = featured
    }

    public static fromObject(community: Community, obj: any) {
        return new SiteSetup(
            obj.cooldown,
            obj.reset,
            obj.tz,
            community,
            obj.site,
            obj.url,
            obj.featured
        )
    }

    public static async list() {
        const user = await User.get()
        const community = await Community.get();
        return (await user!.get(`/community/${community!.id}/voting/site`)).map((s: any) => SiteSetup.fromObject(community!, s))
    }

    async update(url: string, cooldown: number | null, reset: number | null, tz: string | null = null) {
        const user = await User.get()
        const updated = SiteSetup.fromObject(this.community, await user!.patch(`/community/${this.community.id}/voting/site/${this.site.id}`, {
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
        await user!.delete(`/community/${this.community.id}/voting/site/${this.site.id}`)
    }

}