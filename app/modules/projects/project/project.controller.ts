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

class ProjectController {
    static initClass() {
        this.$inject = [
            "$routeParams",
            "tgAppMetaService",
            "$tgAuth",
            "$translate",
            "tgProjectService"
        ];
    }

    constructor(routeParams, appMetaService, auth, translate, projectService) {
        this.routeParams = routeParams;
        this.appMetaService = appMetaService;
        this.auth = auth;
        this.translate = translate;
        this.projectService = projectService;
        this.user = this.auth.userData;

        taiga.defineImmutableProperty(this, "project", () => { return this.projectService.project; });
        taiga.defineImmutableProperty(this, "members", () => { return this.projectService.activeMembers; });

        this.appMetaService.setfn(this._setMeta.bind(this));
    }

    _setMeta(){
        if (!this.project) { return null; }

        let ctx = {projectName: this.project.get("name")};

        return {
            title: this.translate.instant("PROJECT.PAGE_TITLE", ctx),
            description: this.project.get("description")
        };
    }
}
ProjectController.initClass();

angular.module("taigaProjects").controller("Project", ProjectController);
