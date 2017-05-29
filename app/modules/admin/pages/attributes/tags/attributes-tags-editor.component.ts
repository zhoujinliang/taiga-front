import {Component, Input, OnChanges} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-admin-attributes-tags-editor",
    template: require("./attributes-tags-editor.pug")(),
})
export class AdminAttributesTagsEditor implements OnChanges {
    @Input() type: string;
    @Input() name: string;
    @Input() addLabel: string;
    @Input() project: Immutable.Map<string, any>;
    values: Immutable.List<any> = Immutable.List();
    editing: any = {};
    merging: any = {to: null, from: {}};

    ngOnChanges(changes) {
        if (this.project) {
            this.values = this.project.get("tags_colors").map(
                (value, key) => Immutable.fromJS({id: key, name: key, color: value})
            ).toList().sortBy((item) => item.get('id'));
        }
    }
}
