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
 * File: modules/epics/detail.coffee
 */

import {groupBy, bindMethods} from "../../utils"
import {PageMixin} from "../controllerMixins"
import * as angular from "angular"
import * as Immutable from "immutable"

let module = angular.module("taigaEpics");

//############################################################################
//# Epic Detail Controller
//############################################################################

class EpicDetailController extends PageMixin {
    scope: angular.IScope
    rootscope: angular.IScope
    repo:any
    confirm:any
    rs:any
    rs2:any
    params:any
    q:any
    location:any
    log:any
    appMetaService:any
    analytics:any
    navUrls:any
    translate:any
    modelTransform:any
    errorHandlingService:any
    projectService:any

    static initClass() {
        this.$inject = [
            "$scope",
            "$rootScope",
            "$tgRepo",
            "$tgConfirm",
            "$tgResources",
            "tgResources",
            "$routeParams",
            "$q",
            "$tgLocation",
            "$log",
            "tgAppMetaService",
            "$tgAnalytics",
            "$tgNavUrls",
            "$translate",
            "$tgQueueModelTransformation",
            "tgErrorHandlingService",
            "tgProjectService"
        ];
    }

    constructor(scope, rootscope, repo, confirm, rs, rs2, params, q, location,
                  log, appMetaService, analytics, navUrls, translate, modelTransform, errorHandlingService, projectService) {
        super()
        this.scope = scope;
        this.rootscope = rootscope;
        this.repo = repo;
        this.confirm = confirm;
        this.rs = rs;
        this.rs2 = rs2;
        this.params = params;
        this.q = q;
        this.location = location;
        this.log = log;
        this.appMetaService = appMetaService;
        this.analytics = analytics;
        this.navUrls = navUrls;
        this.translate = translate;
        this.modelTransform = modelTransform;
        this.errorHandlingService = errorHandlingService;
        this.projectService = projectService;
        bindMethods(this);

        this.scope.epicRef = this.params.epicref;
        this.scope.sectionName = this.translate.instant("EPIC.SECTION_NAME");
        this.initializeEventHandlers();

        let promise = this.loadInitialData();

        // On Success
        promise.then(() => {
            this._setMeta();
            return this.initializeOnDeleteGoToUrl();
        });

        // On Error
        promise.then(null, this.onInitialDataError.bind(this));
    }

    _setMeta() {
        let title = this.translate.instant("EPIC.PAGE_TITLE", {
            epicRef: `#${this.scope.epic.ref}`,
            epicSubject: this.scope.epic.subject,
            projectName: this.scope.project.name
        });
        let description = this.translate.instant("EPIC.PAGE_DESCRIPTION", {
            epicStatus: (this.scope.statusById[this.scope.epic.status] != null ? this.scope.statusById[this.scope.epic.status].name : undefined) || "--",
            epicDescription: angular.element(this.scope.epic.description_html || "").text()
        });
        return this.appMetaService.setAll(title, description);
    }

    initializeEventHandlers() {
        this.scope.$on("attachment:create", () => {
            return this.analytics.trackEvent("attachment", "create", "create attachment on epic", 1);
        });

        this.scope.$on("comment:new", () => {
            return this.loadEpic();
        });

        return this.scope.$on("custom-attributes-values:edit", () => {
            return this.rootscope.$broadcast("object:updated");
        });
    }

    initializeOnDeleteGoToUrl() {
       let ctx = {project: this.scope.project.slug};
       return this.scope.onDeleteGoToUrl = this.navUrls.resolve("project-epics", ctx);
   }

    loadProject() {
        let project = this.projectService.project.toJS();

        this.scope.projectId = project.id;
        this.scope.project = project;
        this.scope.immutableProject = this.projectService.project;
        this.scope.$emit('project:loaded', project);
        this.scope.statusList = project.epic_statuses;
        this.scope.statusById = groupBy(project.epic_statuses, x => x.id);
        return project;
    }

    loadEpic() {
        return this.rs.epics.getByRef(this.scope.projectId, this.params.epicref).then(epic => {
            let ctx;
            this.scope.epic = epic;
            this.scope.immutableEpic = Immutable.fromJS(epic._attrs);
            this.scope.epicId = epic.id;
            this.scope.commentModel = epic;

            this.modelTransform.setObject(this.scope, 'epic');

            if ((this.scope.epic.neighbors.previous != null ? this.scope.epic.neighbors.previous.ref : undefined) != null) {
                ctx = {
                    project: this.scope.project.slug,
                    ref: this.scope.epic.neighbors.previous.ref
                };
                this.scope.previousUrl = this.navUrls.resolve("project-epics-detail", ctx);
            }

            if ((this.scope.epic.neighbors.next != null ? this.scope.epic.neighbors.next.ref : undefined) != null) {
                ctx = {
                    project: this.scope.project.slug,
                    ref: this.scope.epic.neighbors.next.ref
                };
                return this.scope.nextUrl = this.navUrls.resolve("project-epics-detail", ctx);
            }
        });
    }

    loadUserstories() {
          return this.rs2.userstories.listInEpic(this.scope.epicId).then(data => {
              return this.scope.userstories = data;
          });
      }

    loadInitialData() {
        let project = this.loadProject();

        this.fillUsersAndRoles(project.members, project.roles);
        return this.loadEpic().then(() => this.loadUserstories());
    }

    /*
     * Note: This methods (onUpvote() and onDownvote()) are related to tg-vote-button.
     *       See app/modules/components/vote-button for more info
     */
    onUpvote() {
        let onSuccess = () => {
            this.loadEpic();
            return this.rootscope.$broadcast("object:updated");
        };
        let onError = () => {
            return this.confirm.notify("error");
        };

        return this.rs.epics.upvote(this.scope.epicId).then(onSuccess, onError);
    }

    onDownvote() {
        let onSuccess = () => {
            this.loadEpic();
            return this.rootscope.$broadcast("object:updated");
        };
        let onError = () => {
            return this.confirm.notify("error");
        };

        return this.rs.epics.downvote(this.scope.epicId).then(onSuccess, onError);
    }

    /*
     * Note: This methods (onWatch() and onUnwatch()) are related to tg-watch-button.
     *       See app/modules/components/watch-button for more info
     */
    onWatch() {
        let onSuccess = () => {
            this.loadEpic();
            return this.rootscope.$broadcast("object:updated");
        };
        let onError = () => {
            return this.confirm.notify("error");
        };

        return this.rs.epics.watch(this.scope.epicId).then(onSuccess, onError);
    }

    onUnwatch() {
        let onSuccess = () => {
            this.loadEpic();
            return this.rootscope.$broadcast("object:updated");
        };
        let onError = () => {
            return this.confirm.notify("error");
        };

        return this.rs.epics.unwatch(this.scope.epicId).then(onSuccess, onError);
    }

    onSelectColor(color) {
        let onSelectColorSuccess = () => {
            this.rootscope.$broadcast("object:updated");
            return this.confirm.notify('success');
        };

        let onSelectColorError = () => {
            return this.confirm.notify('error');
        };

        let transform = this.modelTransform.save(function(epic) {
            epic.color = color;
            return epic;
        });

        return transform.then(onSelectColorSuccess, onSelectColorError);
    }
}
EpicDetailController.initClass();

module.controller("EpicDetailController", EpicDetailController);


//############################################################################
//# Epic status display directive
//############################################################################

let EpicStatusDisplayDirective = function($template, $compile) {
    // Display if an epic is open or closed and its status.
    //
    // Example:
    //     tg-epic-status-display(ng-model="epic")
    //
    // Requirements:
    //   - Epic object (ng-model)
    //   - scope.statusById object

    let template = $template.get("common/components/status-display.html", true);

    let link = function($scope, $el, $attrs) {
        let render = function(epic) {
            let status =  $scope.statusById[epic.status];

            let html = template({
                is_closed: status.is_closed,
                status
            });

            html = $compile(html)($scope);
            return $el.html(html);
        };

        $scope.$watch($attrs.ngModel, function(epic) {
            if (epic != null) { return render(epic); }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel"
    };
};

module.directive("tgEpicStatusDisplay", ["$tgTemplate", "$compile", EpicStatusDisplayDirective]);


//############################################################################
//# Epic status button directive
//############################################################################

let EpicStatusButtonDirective = function($rootScope, $repo, $confirm, $loading, $modelTransform, $compile, $translate, $template) {
    // Display the status of epic and you can edit it.
    //
    // Example:
    //     tg-epic-status-button(ng-model="epic")
    //
    // Requirements:
    //   - Epic object (ng-model)
    //   - scope.statusById object
    //   - $scope.project.my_permissions

    let template = $template.get("common/components/status-button.html", true);

    let link = function($scope, $el, $attrs, $model) {
        let status;
        let isEditable = () => $scope.project.my_permissions.indexOf("modify_epic") !== -1;

        let render = epic => {
            status = $scope.statusById[epic.status];

            let html = $compile(template({
                status,
                statuses: $scope.statusList,
                editable: isEditable()
            }))($scope);

            return $el.html(html);
        };

        let save = function(status) {
            let currentLoading = $loading()
                .target($el)
                .start();

            let transform = $modelTransform.save(function(epic) {
                epic.status = status;

                return epic;
            });

            let onSuccess = function() {
                $rootScope.$broadcast("object:updated");
                return currentLoading.finish();
            };

            let onError = function() {
                $confirm.notify("error");
                return currentLoading.finish();
            };

            return transform.then(onSuccess, onError);
        };

        $el.on("click", ".js-edit-status", function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (!isEditable()) { return; }

            return $el.find(".pop-status").popover().open();
        });

        $el.on("click", ".status", function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (!isEditable()) { return; }

            let target = angular.element(event.currentTarget);

            $.fn.popover().closeAll();

            return save(target.data("status-id"));
        });

        $scope.$watch(() => $model.$modelValue != null ? $model.$modelValue.status : undefined
        , function() {
            let epic = $model.$modelValue;
            if (epic) { return render(epic); }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel"
    };
};

module.directive("tgEpicStatusButton", ["$rootScope", "$tgRepo", "$tgConfirm", "$tgLoading", "$tgQueueModelTransformation",
                                        "$compile", "$translate", "$tgTemplate", EpicStatusButtonDirective]);
