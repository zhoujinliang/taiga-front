import {Component, Input, Output, EventEmitter} from "@angular/core";

@Component({
    selector: "tg-kanban-bulk-create-lightbox",
    template: require("./kanban-bulk-create-lightbox.jade")(),
    host: {'class': 'lightbox-generic-bulk'},
})
export class KanbanBulkCreateLightbox {
    @Input() status: number;
    @Output() create: EventEmitter<any>;

    constructor() {
        this.create = new EventEmitter();
    }

    onClick(value) {
        this.create.emit({
            status: this.status,
            subjects: value.split(/\r?\n/),
        });
    }
}
