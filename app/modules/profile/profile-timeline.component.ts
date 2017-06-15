import {Component, Input, OnInit, OnDestroy} from "@angular/core";
import * as Immutable from "immutable";
import {Store} from "@ngrx/store";
import {IState} from "../../app.store";
import * as actions from "./profile.actions";

@Component({
    selector: "tg-profile-timeline",
    template: `<tg-user-timeline [timeline]="timeline" (needMore)="loadMore()" (scrollDisabled)="scrollDisabled">
               </tg-user-timeline>`,
})
export class ProfileTimeline implements OnInit, OnDestroy {
    @Input() user: Immutable.Map<string, any>;
    @Input() timeline: Immutable.List<any>;

    constructor(private store: Store<IState>) {}

    ngOnInit() {
        this.store.dispatch(new actions.FetchProfileTimelineAction(this.user.get('id'), 1));
    }

    ngOnDestroy() {
        this.store.dispatch(new actions.SetProfileTimelineAction(null));
    }
}
