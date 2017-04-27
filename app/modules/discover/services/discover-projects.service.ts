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
 * File: discover-projects.service.coffee
 */

import {Injectable} from "@angular/core";
import * as Immutable from "immutable";
import * as _ from "lodash";
import {defineImmutableProperty} from "../../../libs/utils";
import { ProjectsService } from "../../projects/projects.service";
import { ResourcesService } from "../../resources/resources.service";

@Injectable()
export class DiscoverProjectsService {
    _discoverParams: any = undefined;
    _mostLiked: any;
    _mostActive: any;
    _featured: any;
    _searchResult: any;
    _projectsCount: any;
    _nextSearchPage: any;
    mostLiked: any;
    mostActive: any;
    featured: any;
    searchResult: any;
    projectsCount: any;
    nextSearchPage: any;
    decorate: any;

    constructor(private rs: ResourcesService, private projectsService: ProjectsService) {
        this._discoverParams = { discover_mode: true };
        this._mostLiked = Immutable.List();
        this._mostActive = Immutable.List();
        this._featured = Immutable.List();
        this._searchResult = Immutable.List();
        this._projectsCount = 0;

        this.decorate = this.projectsService._decorate.bind(this.projectsService);

        defineImmutableProperty(this, "mostLiked", () => this._mostLiked);
        defineImmutableProperty(this, "mostActive", () => this._mostActive);
        defineImmutableProperty(this, "featured", () => this._featured);
        defineImmutableProperty(this, "searchResult", () => this._searchResult);
        defineImmutableProperty(this, "nextSearchPage", () => this._nextSearchPage);
        defineImmutableProperty(this, "projectsCount", () => this._projectsCount);
    }

    fetchMostLiked(params) {
        const _params = _.extend({}, this._discoverParams, params);
        return this.rs.projects.getProjects(_params, false)
            .map((result) => {
                const data = result.data.slice(0, 5);

                let projects = Immutable.fromJS(data);
                projects = projects.map(this.decorate);

                return this._mostLiked = projects;
            });
    }

    fetchMostActive(params) {
        const _params = _.extend({}, this._discoverParams, params);
        return this.rs.projects.getProjects(_params, false)
            .map((result) => {
                const data = result.data.slice(0, 5);

                let projects = Immutable.fromJS(data);
                projects = projects.map(this.decorate);

                return this._mostActive = projects;
        });
    }

    fetchFeatured() {
        const _params = _.extend({}, this._discoverParams);
        _params.is_featured = true;

        return this.rs.projects.getProjects(_params, false)
            .map((result) => {
                const data = result.data.slice(0, 4);

                let projects = Immutable.fromJS(data);
                projects = projects.map(this.decorate);

                return this._featured = projects;
        });
    }

    resetSearchList() {
        return this._searchResult = Immutable.List();
    }

    fetchStats() {
        return this.rs.stats.discover().map((discover) => {
            return this._projectsCount = discover.getIn(["projects", "total"]);
        });
    }

    fetchSearch(params) {
        const _params = _.extend({}, this._discoverParams, params);
        return this.rs.projects.getProjects(_params)
            .map((result) => {
                this._nextSearchPage = !!result.headers["X-Pagination-Next"];

                let projects = Immutable.fromJS(result.data);
                projects = projects.map(this.decorate);

                return this._searchResult = this._searchResult.concat(projects);
        });
    }
}
