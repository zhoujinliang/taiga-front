/*
 * Copyright (C) 2014-2015 Taiga Agile LLC <taiga@taiga.io>
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
 * File: discover-search.controller.coffee
 */

import * as angular from "angular";
import * as _ from "lodash";
import {defineImmutableProperty} from "../../../libs/utils";

import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import { search } from "@ngrx/router-store";
import { Store } from "@ngrx/store";
import {TranslateService} from "@ngx-translate/core";
import { IState } from "../../../app.store";
import {AppMetaService} from "../../services/app-meta.service";
import { SearchDiscoverProjects } from "../discover.actions";
import {DiscoverProjectsService} from "../services/discover-projects.service";

@Component({
    selector: "tg-discover-search",
    template: require("./discover-search.pug")(),
})
export class DiscoverSearch implements OnInit {
    q: any;
    filter: any;
    orderBy: any;
    loadingGlobal: boolean;
    loadingList: boolean;
    loadingPagination: boolean;
    searchResults: any;
    projectsCount: any;

    constructor(private route: ActivatedRoute,
                private store: Store<IState>,
                private router: Router,
                private discoverProjects: DiscoverProjectsService,
                private appMetaService: AppMetaService,
                private translate: TranslateService) {
    }

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            this.q = params.text;
            this.filter = params.filter || "all";
            this.orderBy = params.order_by || "";
            this.store.dispatch(new SearchDiscoverProjects(this.q, this.filter, this.orderBy));
        });
        this.searchResults = this.store.select((state) => state.getIn(["discover", "search-results"]));
        this.projectsCount = this.store.select((state) => state.getIn(["discover", "projects-count"]));
        // this.loadingGlobal = false;
        // this.loadingList = false;
        // this.loadingPagination = false;

        const title = this.translate.instant("DISCOVER.SEARCH.PAGE_TITLE");
        const description = this.translate.instant("DISCOVER.SEARCH.PAGE_DESCRIPTION");
        this.appMetaService.setAll(title, description);
    }

    onSearchCriteriaChange() {
        this.store.dispatch(search({filter: this.filter, text: this.q, order_by: this.orderBy}));
    }
}
