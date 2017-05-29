import {Component, Input, OnChanges} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-admin-attributes-custom-fields-editor",
    template: require("./attributes-custom-fields-editor.pug")(),
})
export class AdminAttributesCustomFieldsEditor implements OnChanges {
    @Input() type: string;
    @Input() name: string;
    @Input() project: Immutable.Map<string, any>;
    values: Immutable.List<any>;
    editing: any = {};

    ngOnChanges(changes) {
        if (this.project) {
            if (this.type == "epics") {
                this.values = this.project.get("epic_custom_attributes")
            } else if (this.type == "userstories") {
                this.values = this.project.get("userstory_custom_attributes")
            } else if (this.type == "tasks") {
                this.values = this.project.get("task_custom_attributes")
            } else if (this.type == "issues") {
                this.values = this.project.get("issue_custom_attributes")
            }
            this.values = this.values.sortBy((item) => item.get('order')).toList();
        }
    }
}
