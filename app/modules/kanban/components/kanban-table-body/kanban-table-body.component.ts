import {Component, Input} from "@angular/core"

@Component({
    selector: "tg-kanban-table-body",
    template: require("./kanban-table-body.jade")(),
})
export class KanbanTableBody {
    @Input() statuses: any;
    @Input() userstories: any;
    @Input() folds: any;
    @Input() archivedWatched: any;
}
