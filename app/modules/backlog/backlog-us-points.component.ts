import {Component, Input} from "@angular/core";
import {Store} from "@ngrx/store";
import {IState} from "../../app.store";
import * as Immutable from "immutable";
import * as actions from "./backlog.actions";

@Component({
    selector: "tg-backlog-us-points",
    template: require("./backlog-us-points.pug")(),
})
export class BacklogUsPoints {
    @Input() us: Immutable.Map<string,any>;
    @Input() roles: Immutable.List<any>;
    @Input() points: Immutable.List<any>;
    state: string = "";
    selectedRole: Immutable.Map<string,any>;

    constructor(private store: Store<IState>) {}

    computableRoles() {
        return this.roles.filter((r) => r.get('computable'));
    }

    getRolePoints(role: Immutable.Map<string, any>) {
        let roleId = role.get('id');
        let pointId = this.us.getIn(['points', `${roleId}`]);
        let point = this.points.filter((p) => p.get('id') === pointId).first();
        return point.get('name');
    }

    updatePoints(selectedRole, point) {
        let newPoints = this.us.get('points').set(`${selectedRole.get('id')}`, point.get('id'))
        this.state = "";
        this.store.dispatch(new actions.PatchUsPointsAction(this.us.get('id'), this.us.get('version'), newPoints.toJS()));
    }
}
