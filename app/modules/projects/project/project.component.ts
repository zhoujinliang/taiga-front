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

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { IState } from "../../../app.store";
import { AppMetaService } from "../../services/app-meta.service";
import { FetchCurrentProjectAction } from "../projects.actions";

@Component({
    selector: "tg-project-detail",
    template: require("./project.jade")(),
})
export class ProjectDetail implements OnInit {
    user: any;
    project: any;
    members: any;

    constructor(private appMeta: AppMetaService,
                private translate: TranslateService,
                private store: Store<IState>,
                private route: ActivatedRoute) {
        this.user = this.store.select((state) => state.getIn(["auth", "user"]));
        this.project = this.store.select((state) => state.getIn(["projects", "current-project"]));

        this.project.subscribe((project) => {
            if (project) {
                const title = this.translate.instant("PROJECT.PAGE_TITLE", {projectName: project.get("name")});
                this.appMeta.setTitle(title);
                this.appMeta.setDescription(project.get("description"));
            }
        });
    }

    ngOnInit() {
        this.route.params.subscribe((params) => {
            this.store.dispatch(new FetchCurrentProjectAction(params.slug));
        });
    }
}
