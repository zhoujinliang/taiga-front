import {Component, Input} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-backlog-table",
    template: require("./backlog-table.pug")(),
})
export class BacklogTable {
    @Input() userstories: Immutable.List<any>;
    @Input() currentSprint: Immutable.Map<string, any>;
}
