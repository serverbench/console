import Community from "../Community";
import User from "../User";

export default class SkuOwnership {

    public static async import(file:File){
        const user = await User.get()
        const community = await Community.get()
        await user!.post(`/community/${community!.id}/store/sku/ownership/import`, file)
    }

}