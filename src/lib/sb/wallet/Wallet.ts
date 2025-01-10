import type Currency from "../store/Currency"
import User from "../User"
import WalletTransaction from "./WalletTransaction"

export default class Wallet {

    public readonly id: string
    public readonly currency: Currency
    public readonly withdrawable: number
    public readonly settling: number
    public readonly credit: number

    constructor(id: string, currency: Currency, withdrawable: number, settling: number, credit: number) {
        this.id = id
        this.currency = currency
        this.withdrawable = withdrawable
        this.settling = settling
        this.credit = credit
    }

    private static fromObject(obj: any) {
        return new Wallet(obj.id, obj.currency, obj.withdrawable, obj.settling, obj.credit)
    }

    public static async list() {
        const user = await User.get()!
        return (await user!.get(`/user/wallet`)).map((w: any) => Wallet.fromObject(w))
    }

    public static async create(currency: string) {
        const user = await User.get()!
        return Wallet.fromObject(await user!.get(`/user/wallet/${currency}`))
    }

    public static async getTransactions(page: number) {
        const user = await User.get()!
        return (await user!.post(`/user/wallet/transaction`, {
            page: page
        })).map((t: any) => WalletTransaction.fromObject(Wallet.fromObject(t.wallet), t))
    }

}