import {Component, Input} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import * as moment from "moment";
import * as Immutable from "immutable";

@Component({
    selector: "tg-backlog-sprint-header",
    template: require("./backlog-sprint-header.pug")(),
})
export class BacklogSprintHeader {
    @Input() sprint: Immutable.Map<string, any>;

    constructor(private translate: TranslateService) {}

    estimatedDateRange() {
        const prettyDate = this.translate.instant("BACKLOG.SPRINTS.DATE");
        const start = moment(this.sprint.get('estimated_start')).format(prettyDate);
        const finish = moment(this.sprint.get('estimated_finish')).format(prettyDate);
        return `${start}-${finish}`;
    }
}
