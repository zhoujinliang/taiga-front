import {Component, Input, Output, EventEmitter} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import * as moment from "moment";
import * as Immutable from "immutable";

@Component({
    selector: "tg-backlog-sprint-header",
    template: require("./backlog-sprint-header.pug")(),
})
export class BacklogSprintHeader {
    @Input() sprint: Immutable.Map<string, any>;
    @Input() compactSprint: boolean;
    @Output() compactSprintChange: EventEmitter<boolean>;
    @Output() editSprint: EventEmitter<Immutable.Map<string, any>>;

    constructor(private translate: TranslateService) {
        this.compactSprintChange = new EventEmitter();
        this.editSprint = new EventEmitter();
    }

    estimatedDateRange() {
        const prettyDate = this.translate.instant("BACKLOG.SPRINTS.DATE");
        const start = moment(this.sprint.get('estimated_start')).format(prettyDate);
        const finish = moment(this.sprint.get('estimated_finish')).format(prettyDate);
        return `${start}-${finish}`;
    }
}
