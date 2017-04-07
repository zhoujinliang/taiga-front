/*
 * Copyright (C) 2014-2017 Andrey Antukh <niwi@niwi.nz>
 * Copyright (C) 2014-2017 Jesús Espino Garcia <jespinog@gmail.com>
 * Copyright (C) 2014-2017 David Barragán Merino <bameda@dbarragan.com>
 * Copyright (C) 2014-2017 Alejandro Alonso <alejandro.alonso@kaleidos.net>
 * Copyright (C) 2014-2017 Juan Francisco Alcántara <juanfran.alcantara@kaleidos.net>
 * Copyright (C) 2014-2017 Xavi Julian <xavier.julian@kaleidos.net>
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
 * File: modules/detail.coffee
 */

import * as angular from "angular"

let module = angular.module("taigaCommon");

class DetailController {
    params:any
    repo:any
    projectService:any
    navurls:any
    location:any

    static initClass() {
        this.$inject = [
            '$routeParams',
            '$tgRepo',
            "tgProjectService",
            "$tgNavUrls",
            "$location"
        ];
    }

    constructor(params, repo, projectService, navurls, location) {
        this.params = params;
        this.repo = repo;
        this.projectService = projectService;
        this.navurls = navurls;
        this.location = location;
        this.repo.resolve({
            pslug: this.params.pslug,
            ref: this.params.ref
        })
        .then(result => {
            let url;
            if (result.issue) {
                url = this.navurls.resolve('project-issues-detail', {
                    project: this.projectService.project.get('slug'),
                    ref: this.params.ref
                });
            } else if (result.task) {
                url = this.navurls.resolve('project-tasks-detail', {
                    project: this.projectService.project.get('slug'),
                    ref: this.params.ref
                });
            } else if (result.us) {
                url = this.navurls.resolve('project-userstories-detail', {
                    project: this.projectService.project.get('slug'),
                    ref: this.params.ref
                });
            } else if (result.epic) {
                url = this.navurls.resolve('project-epics-detail', {
                    project: this.projectService.project.get('slug'),
                    ref: this.params.ref
                });
            } else if (result.wikipage) {
                url = this.navurls.resolve('project-wiki-page', {
                    project: this.projectService.project.get('slug'),
                    slug: this.params.ref
                });
            }

            return this.location.path(url);
        });
    }
}
DetailController.initClass();

module.controller("DetailController", DetailController);
