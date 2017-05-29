import {Component, Input, Output, EventEmitter} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-admin-attributes-tags-row",
    template: require("./attributes-tags-row.pug")(),
})
export class AdminAttributesTagsRow {
    @Input() value: Immutable.Map<string, any>;
    @Input() type: string;
    @Output() edit: EventEmitter<number>;

    constructor() {
        this.edit = new EventEmitter();
    }
}
