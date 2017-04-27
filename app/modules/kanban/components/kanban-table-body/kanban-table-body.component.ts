import {Component, Input} from "@angular/core";

@Component({
    selector: "tg-kanban-table-body",
    template: require("./kanban-table-body.jade")(),
})
export class KanbanTableBody {
    @Input() statuses: any;
    @Input() userstories: any;
    @Input() folds: any;
    @Input() zoom: any;
    @Input() archivedWatched: any;
    @Input() project: any;

    trackStatusFn(idx, status) {
        return status.get("id");
    }

    trackUSFn(idx, us) {
        return us.get("id");
    }
}
