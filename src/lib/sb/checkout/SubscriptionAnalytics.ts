import type Currency from "../store/Currency"


interface SubscriptionAnalytics {
    currency: Currency,
    monthly: number,
    total: number,
}

export interface SubscriptionAnalyticsGroup {
    count: number,
    amounts: SubscriptionAnalytics[]
}

export interface SubscriptionAnalyticsGroups {
    mrr: SubscriptionAnalyticsGroup,
    failed: SubscriptionAnalyticsGroup,
    trial: SubscriptionAnalyticsGroup
}