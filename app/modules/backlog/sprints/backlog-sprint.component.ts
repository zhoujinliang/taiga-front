import {Component, Input} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    host: {"class": "sprint"},
    selector: "tg-backlog-sprint",
    template: require('./backlog-sprint.pug')(),
})
export class BacklogSprint {
    @Input() sprint: Immutable.Map<string, any>;
    compactSprint: boolean = false;
}
