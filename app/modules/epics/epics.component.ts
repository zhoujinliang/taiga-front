import * as Immutable from "immutable";

import {Component, OnDestroy, OnInit} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { Observable, Subscription } from "rxjs";
import "rxjs/add/operator/map";
import "rxjs/add/operator/zip";
import { StartLoadingAction, StopLoadingAction, OpenLightboxAction } from "../../app.actions";
import { IState } from "../../app.store";
import { FetchCurrentProjectAction } from "../projects/projects.actions";
import { ZoomLevelService } from "../services/zoom-level.service";
import * as actions from "./epics.actions";

@Component({
    template: require("./epics.pug")(),
})
export class EpicsPage implements OnInit, OnDestroy {
    section = "epics";
    project: Observable<any>;
    epics: Observable<any[]>;
    userStories: Observable<any[]>;
    members: Observable<any>;
    subscriptions: Subscription[];

    constructor(private store: Store<IState>,
                private route: ActivatedRoute,
                private translate: TranslateService,
                private zoomLevel: ZoomLevelService) {
        this.project = this.store.select((state) => state.getIn(["projects", "current-project"]));
        this.members = this.store.select((state) => state.getIn(["projects", "current-project", "members"]));
        this.userStories = this.store.select((state) => state.getIn(["epics", "user-stories"]));
        this.epics = this.store.select((state) => state.getIn(["epics", "epics"]))
                               .filter((epics) => epics !== null)
                               .do(() => this.store.dispatch(new StopLoadingAction()));
    }

    ngOnInit() {
        this.store.dispatch(new StartLoadingAction());
        this.subscriptions = [
            this.project.subscribe((project) => {
                if (project) {
                    this.store.dispatch(new actions.FetchEpicsAction(project.get("id")));
                }
            }),
        ];
    }

    onSorted(value) {
        console.log(value);
    }

    onAddEpicClicked() {
        this.store.dispatch(new OpenLightboxAction("epics.add"));
    }

    ngOnDestroy() {
        for (const subs of this.subscriptions) {
            subs.unsubscribe();
        }
        this.store.dispatch(new actions.CleanEpicsDataAction());
    }
}
