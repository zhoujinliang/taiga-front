import {Component, Input} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-admin-attributes-status-row",
    template: require("./attributes-status-row.pug")(),
})
export class AdminAttributesStatusRow {
    @Input() status: Immutable.Map<string, any>;
    @Input() type: string;
}
