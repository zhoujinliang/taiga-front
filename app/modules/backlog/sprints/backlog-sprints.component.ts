import {Component, Input, Output, EventEmitter} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-backlog-sprints",
    template: require("./backlog-sprints.pug")(),
})
export class BacklogSprints {
    @Input() sprints: Immutable.Map<string, any>;
    @Input() project: Immutable.Map<string, any>;
    @Output() loadClosed: EventEmitter<boolean>;
    @Output() newSprint: EventEmitter<boolean>;
    @Output() editSprint: EventEmitter<Immutable.Map<string, any>>;
    loadingClosed: boolean = false;

    constructor() {
        this.loadClosed = new EventEmitter();
        this.newSprint = new EventEmitter();
        this.editSprint = new EventEmitter();
    }

    totalSprints() {
        return this.sprints.get('closed') + this.sprints.get('open');
    }

    loadClosedSprints() {
        this.loadClosed.emit(this.project.get('id'))
        this.loadingClosed = true;
    }
}
