import {Component, Input} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-tags-line",
    template: require("./tags-line.pug")(),
})
export class TagsLine {
    @Input() tags: Immutable.List<any>;
    @Input() disableColorSelection: boolean = false;
    @Input() canEdit: boolean;
    addTag: boolean;
}
