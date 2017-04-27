import {Component, Input, Output, EventEmitter} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-us-estimation-points-popover",
    template: require("./us-estimation-points-popover.jade")(),
})
export class UsEstimationPointsPopover {
    @Input() points: Immutable.List<any>;
    @Input() selected: number;
    @Output() select: EventEmitter<number>;

    constructor() {
        this.select = new EventEmitter();
    }

    onPointClicked($event, pointId) {
        $event.stopPropagation();
        this.select.emit(pointId);
    }
}
