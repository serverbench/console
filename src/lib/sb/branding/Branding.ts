import Community from "../Community"
import User from "../User"

export interface HSL {
    h: number
    s: number
    l: number
}

export type BrandingImg = 'iso' | 'logo' | 'banner' | 'background'

export default class Branding {

    primary: HSL | null
    secondary: HSL | null
    iso: string | null
    logo: string | null
    banner: string | null
    background: string | null

    private static cache: Branding | null = null

    public static onBranding: (branding: Branding | null) => void = (b) => { }

    constructor(primary: HSL | null, secondary: HSL | null, iso: string | null, logo: string | null, banner: string | null, background: string | null) {
        this.primary = primary
        this.secondary = secondary
        this.iso = iso
        this.logo = logo
        this.banner = banner
        this.background = background
    }

    static fromObj(obj: any) {
        return new Branding(
            obj.primary,
            obj.secondary,
            obj.iso,
            obj.logo,
            obj.banner,
            obj.background
        )
    }

    public static clearCache() {
        Branding.cache = null
        Branding.onBranding(Branding.cache)
    }

    public static async get() {
        if (Branding.cache) return Branding.cache
        try {
            const community = await Community.get()
            const user = await User.get()
            const branding = Branding.fromObj(await user!.get(`/community/${community!.id}/branding`))
            Branding.onBranding(branding)
            Branding.cache = branding
            return branding
        } catch (error) {
            Branding.clearCache()
            return null
        }
    }

    public static async updateColors(primary: HSL | null, secondary: HSL | null) {
        const community = await Community.get()
        const user = await User.get()
        const branding = Branding.fromObj(await user!.post(`/community/${community!.id}/branding/colors`, {
            primaryH: primary?.h ?? undefined,
            primaryS: primary?.s ?? undefined,
            primaryL: primary?.l ?? undefined,
            secondaryH: secondary?.h ?? undefined,
            secondaryS: secondary?.s ?? undefined,
            secondaryL: secondary?.l ?? undefined,
        }))
        Branding.cache = branding
        Branding.onBranding(branding)
        return this
    }

    public static async updateImg(part: BrandingImg, iso: File) {
        const community = await Community.get()
        const user = await User.get()
        const branding = Branding.fromObj(await user!.post(`/community/${community!.id}/branding/img/${part}`, iso))
        Branding.cache = branding
        Branding.onBranding(branding)
        return this
    }

    public static async removeImg(part: BrandingImg) {
        const community = await Community.get()
        const user = await User.get()
        const branding = Branding.fromObj(await user!.delete(`/community/${community!.id}/branding/img/${part}`))
        Branding.cache = branding
        Branding.onBranding(branding)
        return this
    }

}