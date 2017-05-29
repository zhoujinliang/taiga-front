import {Component, Input, OnChanges} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-admin-attributes-issues-editor",
    template: require("./attributes-issues-editor.pug")(),
})
export class AdminAttributesIssuesEditor implements OnChanges {
    @Input() type: string;
    @Input() name: string;
    @Input() addLabel: string;
    @Input() project: Immutable.Map<string, any>;
    values: Immutable.List<any>;
    editing: any = {};

    ngOnChanges(changes) {
        if (this.project) {
            if (this.type == "severities") {
                this.values = this.project.get("severities")
            } else if (this.type == "priorities") {
                this.values = this.project.get("priorities")
            } else if (this.type == "types") {
                this.values = this.project.get("issue_types")
            }
        }
    }
}
