import ChatMessage from "../chat/ChatMessage"
import type BriefingSection from "./BriefingSection"

export default class BriefingHighlight {
    content: string
    title: string
    messages: ChatMessage[]
    section:BriefingSection

    constructor(content: string, title: string, messages: ChatMessage[], section: BriefingSection) {
        this.content = content
        this.title = title
        this.messages = messages
        this.section = section
    }
    public static fromObject(obj: any, section: BriefingSection): BriefingHighlight {
        return new BriefingHighlight(
            obj.content,
            obj.title,
            (obj.messages || []).map((msg: any) => ChatMessage.fromObj(section.briefing.community, msg)),
            section
        );
    }
}