import {Component, Input, Output, EventEmitter} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-backlog-menu",
    template: require("./backlog-menu.pug")(),
})
export class BacklogMenu {
    @Input() userstories: Immutable.List<any>;
    @Input() stats: Immutable.List<any>;
    @Input() currentSprint: Immutable.Map<string, any>;
    @Input() showFilters: boolean = false;
    @Output() showFiltersChange: EventEmitter<boolean>;
    @Input() showTags: boolean = false;
    @Output() showTagsChange: EventEmitter<boolean>;

    constructor() {
        this.showFiltersChange = new EventEmitter();
        this.showTagsChange = new EventEmitter();
    }
}
