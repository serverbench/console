import type Currency from "../store/Currency"

interface ChargeAnalytics {
    currency: Currency,
    net: number,
    gross: number
}

// Corrected interface name
export interface ChargeAnalyticsGroup {
    count: number,
    amounts: ChargeAnalytics[]
}