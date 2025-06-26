import User from "../User";
import Repository from "./Repository";

export default class Developer {

    public readonly id:string
    public readonly platform: 'github';
    public readonly eid: string;
    public readonly username: string;
    public readonly repositories: Repository[]

    constructor(id:string, platform: 'github', eid: string, username: string, repositories: Repository[]) {
        this.id = id;
        this.platform = platform;
        this.eid = eid;
        this.username = username;
        this.repositories = repositories;
    }

    public static fromObj(obj: any): Developer {
        return new Developer(
            obj.id,
            obj.platform,
            obj.eid,
            obj.username,
            obj.repositories.map((repo: any) => Repository.fromObj(repo))
        );
    }

    public static async list(refresh: boolean = false): Promise<Developer[]> {
        const user = await User.get()
        return (await user?.get('/user/ci' + (refresh ? '/update' : ''))).map((dev: any) => Developer.fromObj(dev));
    }

    public static async link(platform: 'github') {
        const user = await User.get()
        const { url } = await user!.get('/user/ci/' + platform + '/setup')
        window.open(url, '_blank')
    }

}