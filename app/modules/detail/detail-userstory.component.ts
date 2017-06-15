import {Component, Input, OnInit, OnDestroy} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import * as Immutable from "immutable";
import {Observable, Subscription} from "rxjs";
import {Store} from "@ngrx/store";
import {IState} from "../../app.store";
import {StartLoadingAction, StopLoadingAction} from "../../app.actions";
import * as actions from "./detail.actions";

@Component({
    template: require("./detail-userstory.pug")(),
})
export class DetailUserstoryPage implements OnInit, OnDestroy {
    us: Immutable.Map<string,any>;
    project: Immutable.Map<string,any>;
    subscriptions: Subscription[];

    constructor(private store: Store<IState>, private route: ActivatedRoute) {
        this.store.dispatch(new StartLoadingAction());
    }

    ngOnInit() {
        this.subscriptions = [
            this.store.select((state) => state.getIn(["detail", "userstory"]))
                      .subscribe((state) => {
                          this.us = state;
                          this.store.dispatch(new StopLoadingAction());
                      }),
            this.store.select((state) => state.getIn(["projects", "current-project"]))
                      .subscribe((state) => this.project = state),
            this.store.select((state) => state.getIn(["projects", "current-project"]))
                      .combineLatest(this.route.params)
                      .subscribe(([project, params]) => {
                          if (project) {
                              this.store.dispatch(new actions.FetchDetailUserStoryAction(project.get('id'), params.ref));
                          }
                      })
        ];
    }

    ngOnDestroy() {
        for (let sub of this.subscriptions) {
            sub.unsubscribe();
        }
    }
}
