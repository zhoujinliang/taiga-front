import {Component, EventEmitter, Input, Output} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    host: {class: "lightbox-generic-bulk"},
    selector: "tg-kanban-bulk-create-lightbox",
    template: require("./kanban-bulk-create-lightbox.pug")(),
})
export class KanbanBulkCreateLightbox {
    @Input() status: number;
    @Input() project: Immutable.Map<string, any>;
    @Output() create: EventEmitter<any>;

    constructor() {
        this.create = new EventEmitter();
    }

    onClick(value) {
        this.create.emit({
            projectId: this.project.get('id'),
            statusId: this.status,
            subjects: value,
        });
    }
}
