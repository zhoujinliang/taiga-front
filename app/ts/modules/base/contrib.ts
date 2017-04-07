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
 * File: modules/base/contrib.coffee
 */

import {Controller} from "../../classes"
import * as _ from "lodash"
import * as angular from "angular"

let module = angular.module("taigaBase");


class ContribController extends Controller {
    rootScope: angular.IScope
    scope: angular.IScope
    params:any
    repo:any
    rs:any
    confirm:any
    projectService:any

    static initClass() {
        this.$inject = [
            "$rootScope",
            "$scope",
            "$routeParams",
            "$tgRepo",
            "$tgResources",
            "$tgConfirm",
            "tgProjectService"
        ];
    }

    constructor(rootScope, scope, params, repo, rs, confirm, projectService) {
        super()
        this.rootScope = rootScope;
        this.scope = scope;
        this.params = params;
        this.repo = repo;
        this.rs = rs;
        this.confirm = confirm;
        this.projectService = projectService;
        this.scope.currentPlugin = _.head(_.filter(this.rootScope.adminPlugins, {"slug": this.params.plugin}));
        this.scope.projectSlug = this.params.pslug;

        this.loadInitialData();
    }

    loadProject() {
        let project = this.projectService.project.toJS();

        this.scope.projectId = project.id;
        this.scope.project = project;
        this.scope.$emit('project:loaded', project);
        this.scope.$broadcast('project:loaded', project);
        return project;
    }

    loadInitialData() {
        return this.loadProject();
    }
}
ContribController.initClass();

module.controller("ContribController", ContribController);


class ContribUserSettingsController extends Controller {
    rootScope: angular.IScope
    scope: angular.IScope
    params:any

    static initClass() {
        this.$inject = [
            "$rootScope",
            "$scope",
            "$routeParams"
        ];
    }

    constructor(rootScope, scope, params) {
        super()
        this.rootScope = rootScope;
        this.scope = scope;
        this.params = params;
        this.scope.currentPlugin = _.head(_.filter(this.rootScope.userSettingsPlugins, {"slug": this.params.plugin}));
    }
}
ContribUserSettingsController.initClass();

module.controller("ContribUserSettingsController", ContribUserSettingsController);
