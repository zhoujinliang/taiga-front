import {Component, Input} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-tag",
    template: require("./tag.pug")(),
})
export class Tag {
    @Input() tag: Immutable.Map<string,any>;
    @Input() canEdit: boolean;
    loadingRemoveTag: boolean = false;
}
