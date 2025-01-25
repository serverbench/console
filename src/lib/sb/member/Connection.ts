import type Community from "../Community"
import ReferralCode from "../referral/ReferralCode"
import ListingSite from "../voting/site/ListingSite"
import Member from "./Member"

export default class Connection {

    public readonly id: string | null
    public readonly idle: boolean
    public readonly created: Date
    public readonly closed: Date | null
    public readonly member: Member
    public readonly ip: string | null
    public readonly country: string | null
    public readonly timezone: string | null
    public readonly entrypoint: string | null
    public readonly referral: ReferralCode | null
    public readonly listingSite: ListingSite | null


    constructor(
        id: string,
        created: Date,
        closed: Date | null,
        member: Member,
        ip: string | null,
        country: string | null,
        timezone: string | null,
        entrypoint: string | null,
        referral: ReferralCode | null,
        listingSite: ListingSite | null,
        idle: boolean
    ) {
        this.id = id
        this.created = created
        this.closed = closed
        this.member = member
        this.ip = ip
        this.country = country
        this.timezone = timezone
        this.entrypoint = entrypoint
        this.referral = referral
        this.listingSite = listingSite
        this.idle = idle
    }

    public static fromObj(obj: any, member: Member) {
        return new Connection(
            obj.id,
            new Date(obj.created),
            obj.closed ? new Date(obj.closed) : null,
            member,
            obj.ip,
            obj.country,
            obj.timezone,
            obj.entrypoint,
            obj.referral ? ReferralCode.fromObj(obj.referral, member.community) : null,
            obj.listingSite && obj.listingSite.domain ? ListingSite.fromObject(null, obj.listingSite) : null,
            obj.idle
        )
    }

}