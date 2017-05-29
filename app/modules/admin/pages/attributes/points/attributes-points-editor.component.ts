import {Component, Input, OnChanges} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-admin-attributes-points-editor",
    template: require("./attributes-points-editor.pug")(),
})
export class AdminAttributesPointsEditor implements OnChanges {
    @Input() type: string;
    @Input() name: string;
    @Input() addLabel: string;
    @Input() project: Immutable.Map<string, any>;
    values: Immutable.List<any>;
    editing: any = {};

    ngOnChanges(changes) {
        if (this.project) {
            this.values = this.project.get("points")
        }
    }
}
