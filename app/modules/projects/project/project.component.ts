/*
 * Copyright (C) 2014-2017 Taiga Agile LLC <taiga@taiga.io>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * File: project.controller.coffee
 */

import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { IState } from "../../../app.store";
import { StartLoadingAction, StopLoadingAction } from "../../../app.actions";
import { AppMetaService } from "../../services/app-meta.service";
import { FetchCurrentProjectAction, FetchProjectTimelineAction, SetProjectTimelineAction} from "../projects.actions";
import * as Immutable from "immutable";
import {Observable, Subscription} from "rxjs";

@Component({
    selector: "tg-project-detail",
    template: require("./project.pug")(),
})
export class ProjectDetail implements OnInit, OnDestroy {
    user: Observable<Immutable.Map<string, any>>;
    project: Observable<Immutable.Map<string, any>>;
    timeline: Observable<Immutable.Map<string, any>>;
    subscription: Subscription;

    constructor(private appMeta: AppMetaService,
                private translate: TranslateService,
                private store: Store<IState>,
                private route: ActivatedRoute) {
        this.store.dispatch(new StartLoadingAction());
        this.user = this.store.select((state) => state.getIn(["auth", "user"]));
        this.project = this.store.select((state) => state.getIn(["projects", "current-project"]))
                                 .filter((p) => p !== null)
                                 .do(() => this.store.dispatch(new StopLoadingAction()));
        this.timeline = this.store.select((state) => state.getIn(["projects", "timeline"]))
    }

    ngOnInit() {
        this.subscription = this.project.subscribe((project) => {
            if (project) {
                const title = this.translate.instant("PROJECT.PAGE_TITLE", {projectName: project.get("name")});
                this.appMeta.setTitle(title);
                this.appMeta.setDescription(project.get("description"));
                this.store.dispatch(new SetProjectTimelineAction(Immutable.List(), 0, true));
                this.store.dispatch(new FetchProjectTimelineAction(project.get('id'), 1));
            }
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    nextTimelinePage([projectId, currentPage]) {
        this.store.dispatch(new FetchProjectTimelineAction(projectId, currentPage + 1));
    }
}
