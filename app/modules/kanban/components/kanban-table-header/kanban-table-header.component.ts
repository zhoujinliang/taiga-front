import {Component, Input, Output, EventEmitter} from "@angular/core"
import * as Immutable from "immutable";

@Component({
    selector: "tg-kanban-table-header",
    template: require("./kanban-table-header.jade")(),
})
export class KanbanTableHeader {
    @Input() statuses: Immutable.List<any>;
    @Input() folds: any;
    @Output("folds") foldsChange: EventEmitter<any>;
    @Input() archivedWatched: any = {}
    @Output("archivedWatched") archivedWatchedChange: EventEmitter<any>;

    constructor() {
        this.foldsChange = new EventEmitter();
        this.archivedWatchedChange = new EventEmitter();
    }

    foldStatus(status) {
        this.folds[status.get('id')] = true;
        this.foldsChange.emit(this.folds);
    }

    unfoldStatus(status) {
        this.folds[status.get('id')] = false;
        this.foldsChange.emit(this.folds);
    }

    archivedWatch(status) {
        this.archivedWatched[status.get('id')] = true;
        this.archivedWatchedChange.emit(this.archivedWatched);
    }

    archivedUnwatch(status) {
        this.archivedWatched[status.get('id')] = false;
        this.archivedWatchedChange.emit(this.archivedWatched);
    }
}
