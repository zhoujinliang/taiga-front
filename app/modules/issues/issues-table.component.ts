import {Component, Input, Output, EventEmitter} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-issues-table",
    template: require("./issues-table.pug"),
})
export class IssuesTable {
    @Input() project: Immutable.Map<string, any>;
    @Input() issues: Immutable.List<any>;
    @Output() addNewIssue: EventEmitter<boolean>;
    @Output() addIssuesInBulk: EventEmitter<boolean>;

    constructor() {
        this.addNewIssue = new EventEmitter()
        this.addIssuesInBulk = new EventEmitter()
    }
}
