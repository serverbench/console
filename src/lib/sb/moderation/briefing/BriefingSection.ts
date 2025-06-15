import Instance from "$lib/sb/server/Instance";
import type Briefing from "./Briefing";
import BriefingHighlight from "./BriefingHighlight";

export default class BriefingSection {
    public readonly briefing: Briefing
    public readonly instance: Instance|null

    private _highlights: BriefingHighlight[];
    public get highlights(): BriefingHighlight[] {
        return this._highlights;
    }

    constructor(briefing: Briefing, instance: Instance | null, highlights: BriefingHighlight[] = []) {
        this.briefing = briefing;
        this.instance = instance;
        this._highlights = highlights;
    }

    public static fromObject(obj: any, briefing: Briefing): BriefingSection {
        const section = new BriefingSection(
            briefing,
            obj.instance ? Instance.fromObj(
                obj.instance.server,
                obj.instance,
            ) : null,
            []
        );
        section._highlights = (obj.highlights || []).map((highlight: any) => BriefingHighlight.fromObject(highlight, section));
        return section;
    }
}