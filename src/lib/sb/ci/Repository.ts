export default class Repository {
    public readonly id: string;
    public readonly eid: string;
    public readonly uri: string
    public readonly branches: string[]
    constructor(id: string, eid: string, uri: string, branches: string[]) {
        this.id = id;
        this.eid = eid;
        this.uri = uri;
        this.branches = branches;
    }

    public static fromObj(obj: any): Repository {
        return new Repository(
            obj.id,
            obj.eid,
            obj.uri,
            obj.branches
        );
    }
}