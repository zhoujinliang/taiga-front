import {Component, Input} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-team-current-user",
    template: require("./team-current-user.pug")(),
})
export class TeamCurrentUser {
    @Input() user: Immutable.Map<string, any>;
    @Input() project: Immutable.Map<string, any>;
    @Input() stats: Immutable.Map<string, any>;
}
