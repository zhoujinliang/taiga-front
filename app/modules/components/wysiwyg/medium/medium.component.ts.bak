import {getIcon} from "./medium.utils";
import {Component, Input, ElementRef} from "@angular/core";
import {MentionExtension} from "../../../../libs/medium-mention";
import * as AutoList from "medium-editor-autolist";
import * as extensions from "./medium.extensions";

@Component({
    selector: "tg-medium",
    template: "",
})
export class MediumEditor {
    @Input() placeholder: string;
    instance: MediumEditor;

    constructor(private el: ElementRef) {
        this.instance = new MediumEditor(this.el.nativeElement, {
            imageDragging: false,
            placeholder: {
                text: this.placeholder,
            },
            toolbar: {
                buttons: [
                    {
                        name: "bold",
                        contentDefault: getIcon("editor-bold"),
                    },
                    {
                        name: "italic",
                        contentDefault: getIcon("editor-italic"),
                    },
                    {
                        name: "strikethrough",
                        contentDefault: getIcon("editor-cross-out"),
                    },
                    {
                        name: "anchor",
                        contentDefault: getIcon("editor-link"),
                    },
                    {
                        name: "image",
                        contentDefault: getIcon("editor-image"),
                    },
                    {
                        name: "orderedlist",
                        contentDefault: getIcon("editor-list-n"),
                    },
                    {
                        name: "unorderedlist",
                        contentDefault: getIcon("editor-list-o"),
                    },
                    {
                        name: "h1",
                        contentDefault: getIcon("editor-h1"),
                    },
                    {
                        name: "h2",
                        contentDefault: getIcon("editor-h2"),
                    },
                    {
                        name: "h3",
                        contentDefault: getIcon("editor-h3"),
                    },
                    {
                        name: "quote",
                        contentDefault: getIcon("editor-quote"),
                    },
                    {
                        name: "removeFormat",
                        contentDefault: getIcon("editor-no-format"),
                    },
                    {
                        name: "rtl",
                        contentDefault: getIcon("editor-rtl"),
                    },
                    {
                        name: "code",
                        contentDefault: getIcon("editor-code"),
                    },
                ],
            },
            extensions: {
                paste: new extensions.CustomPasteHandler(),
                code: new extensions.CodeButton(),
                autolist: new AutoList(),
                alignright: new extensions.AlignRightButton(),
                mediumMention: new MentionExtension({
                    getItems(mention, mentionCb) {
                        return wysiwygMentionService.search(mention).then(mentionCb);
                    },
                }),
            },
        });

    }
}
