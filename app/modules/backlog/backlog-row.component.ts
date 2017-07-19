import { Component, Input} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    host: {"class": "row us-item-row"},
    selector: "tg-backlog-row",
    template: require("./backlog-row.pug")(),
})
export class BacklogRow {
    @Input() project: Immutable.Map<string, any>;
    @Input() us: Immutable.Map<string, any>;
    @Input() showTags: boolean;
    @Input() canEdit: boolean;
}
