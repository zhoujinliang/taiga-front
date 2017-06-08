import {Component, Input} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-backlog-summary",
    template: require("./backlog-summary.pug")(),
})
export class BacklogSummary {
    @Input() stats: Immutable.Map<string, any>;

    completedPercentage() {
        const definedPoints = this.stats.get('defined_points');
        const totalPoints = this.stats.get('total_points') ? this.stats.get('total_points') : definedPoints;
        if (totalPoints) {
            return Math.round((100 * this.stats.get('closed_points')) / totalPoints);
        }
        return 0;
    }
}
