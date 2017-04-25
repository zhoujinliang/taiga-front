import {Component, Input, OnChanges} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-kanban-table",
    template: require("./kanban-table.jade")(),
})
export class KanbanTable implements OnChanges {
    @Input() project: Immutable.Map<string, any>;
    @Input() userstories: Immutable.List<any>;
    statuses: Immutable.List<any> = Immutable.List();
    folds: any = {}
    archivedWatched: any = {}

    ngOnChanges() {
        if (this.project) {
            this.statuses = this.project.get('us_statuses').sortBy((data) => data.get('order'));
        }
    }
}
