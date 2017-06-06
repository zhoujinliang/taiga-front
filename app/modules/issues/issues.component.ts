import * as Immutable from "immutable";

import {Component, OnDestroy, OnInit} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { Observable, Subscription } from "rxjs";
import "rxjs/add/operator/map";
import "rxjs/add/operator/zip";
import { StartLoadingAction, StopLoadingAction } from "../../app.actions";
import { IState } from "../../app.store";
import { FetchCurrentProjectAction } from "../projects/projects.actions";
import { ZoomLevelService } from "../services/zoom-level.service";
import * as actions from "./issues.actions";

@Component({
    template: require("./issues.pug")(),
})
export class IssuesPage implements OnInit, OnDestroy {
    section: string = "issues";
    project: Observable<any>;
    issues: Observable<any[]>;
    appliedFilters: Observable<any>;
    selectedFiltersCount: number = 0;
    members: Observable<any>;
    assignedOnAssignedTo: Observable<Immutable.List<number>>;
    filtersOpen: boolean = false;
    subscriptions: Subscription[];
    bulkCreateState: Observable<number>;

    constructor(private store: Store<IState>,
                private route: ActivatedRoute,
                private translate: TranslateService,
                private zoomLevel: ZoomLevelService) {
        this.project = this.store.select((state) => state.getIn(["projects", "current-project"]));
        this.members = this.store.select((state) => state.getIn(["projects", "current-project", "members"]));
        this.issues = this.store.select((state) => state.getIn(["issues", "issues"]));
        this.appliedFilters = this.store.select((state) => state.getIn([this.section, "appliedFilters"]));
    }

    ngOnInit() {
        this.subscriptions = [
            this.project.subscribe((project) => {
                if (project) {
                    this.store.dispatch(new actions.FetchIssuesAppliedFiltersAction(project.get("id")));
                }
            }),
            Observable.zip(this.project, this.appliedFilters).subscribe(([project, appliedFilters]: any[]) => {
                if (project && appliedFilters) {
                    this.store.dispatch(new actions.FetchIssuesFiltersDataAction(project.get("id"), appliedFilters));
                    this.store.dispatch(new actions.FetchIssuesAction(project.get("id"), appliedFilters));
                }
            }),
        ];
    }

    ngOnDestroy() {
        for (const subs of this.subscriptions) {
            subs.unsubscribe();
        }
    }
}
