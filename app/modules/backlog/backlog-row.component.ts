import { Component, Input} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-backlog-row",
    template: require("./backlog-row.pug")(),
})
export class BacklogRow {
    @Input() us: Immutable.Map<string, any>;
    @Input() showTags: boolean;
}
