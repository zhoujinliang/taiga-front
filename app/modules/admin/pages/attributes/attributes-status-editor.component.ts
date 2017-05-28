import {Component, Input, OnChanges} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-admin-attributes-status-editor",
    template: require("./attributes-status-editor.pug")(),
})
export class AdminAttributesStatusEditor implements OnChanges {
    @Input() type: string;
    @Input() name: string;
    @Input() project: Immutable.Map<string, any>;
    values: Immutable.List<any>;

    ngOnChanges(changes) {
        if (this.project) {
            if (this.type == "epic-statuses") {
                this.values = this.project.get('epic_statuses')
            } else if (this.type == "userstory-statuses") {
                this.values = this.project.get('us_statuses')
            } else if (this.type == "task-statuses") {
                this.values = this.project.get('task_statuses')
            } else if (this.type == "issue-statuses") {
                this.values = this.project.get('issue_statuses')
            }
        }
    }
}
