import Branding from "./branding/Branding"
import type Member from "./member/Member"
import User from "./User"

export default class Community {

    id: string
    name: string
    slug: string

    private static selected: Community | null = null
    private static listed: Community[] = []
    public static onSelected: (community: Community | null, communities: Community[]) => void = () => { }

    public toObj() {
        return {
            id: this.id,
            name: this.name,
            slug: this.slug
        }
    }

    public static async get(): Promise<Community | null> {
        if (Community.selected) return Community.selected
        const saved = localStorage.getItem('community')
        try {
            if (!saved) throw new Error('no saved community')
            Community.selected = Community.fromObj(JSON.parse(saved))
            Community.selected.select()
            Community.list().then((communities) => {
                const selectedOnline = communities.find(c => c.id == Community.selected!.id)
                if (!selectedOnline) {
                    // if the selected community was not found, we select the next one, or call unselected
                    const newSelected = communities[0]
                    if (newSelected) {
                        newSelected.select()
                    } else {
                        Community.unselect()
                    }
                } else if (Community.selected) {
                    // call selected, as the community list has been updated
                    selectedOnline.select()
                } else {
                    // no selected community was found after loading the community list, unselect
                    Community.unselect()
                }
            })
        } catch (error) {
            await Community.list()
            if (Community.listed.length <= 0) {
                Community.unselect()
            } else {
                Community.listed[0].select()
            }
        }
        return Community.selected
    }


    public static unselect() {
        Community.selected = null
        localStorage.removeItem('community')
        Community.onSelected(null, Community.listed)
        Branding.clearCache()
    }

    public select() {
        Community.selected = this
        localStorage.setItem('community', JSON.stringify({
            id: this.id,
            name: this.name,
            slug: this.slug
        }))
        Community.onSelected(this, Community.listed)
    }

    constructor(id: string, name: string, slug: string) {
        this.id = id
        this.name = name
        this.slug = slug
    }

    public static fromObj(obj: any) {
        return new Community(
            obj.id,
            obj.name,
            obj.slug
        )
    }

    public static async list(): Promise<Community[]> {
        Community.listed = (await (await User.get())!
            .get('/community')
        )
            .map((c: any) => Community.fromObj(c))
        return Community.listed
    }

    public static async create(name: string, slug: string) {
        const community = await Community.fromObj(await (await User.get())!.post('/community', {
            name,
            slug
        }))
        Community.listed.push(community)
        return community
    }

    public async getKeys(): Promise<{
        pk: string,
        sk: string
    }> {
        return (await User.get())!.get(`/community/${this.id}/keys`)
    }

    public async getActivityClock(member: Member | null = null): Promise<number[][]> {
        return (await User.get())!.post(`/community/${this.id}/activity/clock`, {
            memberId: member ? member.id : null
        })
    }
}