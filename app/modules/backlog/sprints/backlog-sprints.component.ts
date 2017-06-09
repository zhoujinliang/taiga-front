import {Component, Input} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-backlog-sprints",
    template: require("./backlog-sprints.pug")(),
})
export class BacklogSprints {
    @Input() sprints: Immutable.Map<string, any>;

    openSprints() {
        return this.sprints.get('sprints').filter((sprint:any) => sprint.get('closed') === false).toList();
    }

    closedSprints() {
        return this.sprints.get('sprints').filter((sprint:any) => sprint.get('closed') === true).toList();
    }

    totalSprints() {
        return this.sprints.get('closed') + this.sprints.get('open');
    }
}
