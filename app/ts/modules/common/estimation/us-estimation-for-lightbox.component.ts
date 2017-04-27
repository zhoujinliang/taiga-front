import {Component, Input, OnChanges} from "@angular/core"
import * as Immutable from "immutable";

@Component({
    selector: "tg-us-estimation-for-lightbox",
    template: require("./us-estimation-for-lightbox.jade")(),
})
export class UsEstimationForLightbox implements OnChanges {
    @Input() roles;
    @Input() points;
    private roleOpen:number = null;
    computableRoles: Immutable.List<any> = Immutable.List();

    ngOnChanges() {
        if (this.roles) {
            this.computableRoles = this.roles.filter((role) => role.get('computable'))
        }
    }

    openRole(roleId) {
        this.roleOpen = roleId;
    }

    onPointsSelect(roleId, eventId) {
        this.roleOpen = null;
        console.log(roleId, eventId)
    }
}
