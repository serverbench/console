import type Wallet from "./Wallet"

export default class WalletTransaction {

    public readonly created:Date
    public readonly id: string
    public readonly net: number
    public readonly hash: string
    public readonly wallet: Wallet

    constructor(wallet: Wallet, id: string, net: number, hash: string, created:Date) {
        this.wallet = wallet
        this.id = id
        this.net = net
        this.hash = hash
        this.created = created
    }

    public static fromObject(wallet: Wallet, obj: any) {
        return new WalletTransaction(wallet, obj.id, obj.net, obj.hash, obj.created)
    }

}