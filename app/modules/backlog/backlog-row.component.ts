import { Component, Input} from "@angular/core";
import {Store} from "@ngrx/store";
import {IState} from "../../app.store";
import * as actions from "./backlog.actions";
import * as Immutable from "immutable";

@Component({
    host: {"class": "row us-item-row"},
    selector: "tg-backlog-row",
    template: require("./backlog-row.pug")(),
})
export class BacklogRow {
    @Input() project: Immutable.Map<string, any>;
    @Input() us: Immutable.Map<string, any>;
    @Input() showTags: boolean;
    @Input() canEdit: boolean;
    displayStatusList: boolean = false;

    constructor(private store: Store<IState>) {}

    updateStatus(newStatus) {
        this.displayStatusList = false;
        this.store.dispatch(new actions.PatchUsStatusAction(this.us.get('id'), this.us.get('version'), newStatus))
    }
}
