import {Component, Input} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-invite-members",
    template: require("./invite-members.pug"),
})
export class InviteMembers {
    @Input() members: Immutable.List<any>;
    @Input() invitedMembers: Immutable.List<any>;
}
