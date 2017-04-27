import {Component, EventEmitter, Input, Output} from "@angular/core";

@Component({
    host: {class: "lightbox-generic-bulk"},
    selector: "tg-kanban-bulk-create-lightbox",
    template: require("./kanban-bulk-create-lightbox.jade")(),
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
