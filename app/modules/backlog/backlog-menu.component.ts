import {Component, Input} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-backlog-menu",
    template: require("./backlog-menu.pug")(),
})
export class BacklogMenu {
    @Input() userstories: Immutable.List<any>;
    @Input() stats: Immutable.List<any>;
    @Input() currentSprint: Immutable.Map<string, any>;
}
