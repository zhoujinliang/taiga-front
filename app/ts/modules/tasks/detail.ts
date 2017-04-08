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
 * File: modules/tasks/detail.coffee
 */

import {groupBy, bindMethods} from "../../utils"
import {PageMixin} from "../controllerMixins"

import * as angular from "angular"

let module = angular.module("taigaTasks");


//############################################################################
//# Task Detail Controller
//############################################################################

class TaskDetailController extends PageMixin {
    scope: angular.IScope
    rootscope: angular.IScope
    repo:any
    confirm:any
    rs:any
    params:any
    q:any
    location:any
    log:any
    appMetaService:any
    navUrls:any
    analytics:any
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
            "$routeParams",
            "$q",
            "$tgLocation",
            "$log",
            "tgAppMetaService",
            "$tgNavUrls",
            "$tgAnalytics",
            "$translate",
            "$tgQueueModelTransformation",
            "tgErrorHandlingService",
            "tgProjectService"
        ];
    }

    constructor(scope, rootscope, repo, confirm, rs, params, q, location,
                  log, appMetaService, navUrls, analytics, translate, modelTransform, errorHandlingService, projectService) {
        super()
        this.scope = scope;
        this.rootscope = rootscope;
        this.repo = repo;
        this.confirm = confirm;
        this.rs = rs;
        this.params = params;
        this.q = q;
        this.location = location;
        this.log = log;
        this.appMetaService = appMetaService;
        this.navUrls = navUrls;
        this.analytics = analytics;
        this.translate = translate;
        this.modelTransform = modelTransform;
        this.errorHandlingService = errorHandlingService;
        this.projectService = projectService;
        bindMethods(this);

        this.scope.taskRef = this.params.taskref;
        this.scope.sectionName = this.translate.instant("TASK.SECTION_NAME");
        this.initializeEventHandlers();

        let promise = this.loadInitialData();

        promise.then(() => {
            this._setMeta();
            return this.initializeOnDeleteGoToUrl();
        });

        promise.then(null, this.onInitialDataError.bind(this));
    }

    _setMeta() {
        let title = this.translate.instant("TASK.PAGE_TITLE", {
            taskRef: `#${this.scope.task.ref}`,
            taskSubject: this.scope.task.subject,
            projectName: this.scope.project.name
        });
        let description = this.translate.instant("TASK.PAGE_DESCRIPTION", {
            taskStatus: (this.scope.statusById[this.scope.task.status] != null ? this.scope.statusById[this.scope.task.status].name : undefined) || "--",
            taskDescription: angular.element(this.scope.task.description_html || "").text()
        });
        return this.appMetaService.setAll(title, description);
    }

    initializeEventHandlers() {
        this.scope.$on("attachment:create", () => {
            return this.analytics.trackEvent("attachment", "create", "create attachment on task", 1);
        });
        this.scope.$on("custom-attributes-values:edit", () => {
            return this.rootscope.$broadcast("object:updated");
        });
        return this.scope.$on("comment:new", () => {
            return this.loadTask();
        });
    }

    initializeOnDeleteGoToUrl() {
        let ctx:any = {project: this.scope.project.slug};
        this.scope.onDeleteGoToUrl = this.navUrls.resolve("project", ctx);
        if (this.scope.project.is_backlog_activated) {
            if (this.scope.task.milestone) {
                ctx.sprint = this.scope.sprint.slug;
                return this.scope.onDeleteGoToUrl = this.navUrls.resolve("project-taskboard", ctx);
            } else if (this.scope.task.us) {
                ctx.ref = this.scope.us.ref;
                return this.scope.onDeleteGoToUrl = this.navUrls.resolve("project-userstories-detail", ctx);
            }
        } else if (this.scope.project.is_kanban_activated) {
            if (this.scope.us) {
                ctx.ref = this.scope.us.ref;
                return this.scope.onDeleteGoToUrl = this.navUrls.resolve("project-userstories-detail", ctx);
            }
        }
    }

    loadProject() {
        let project = this.projectService.project.toJS();

        this.scope.projectId = project.id;
        this.scope.project = project;
        this.scope.$emit('project:loaded', project);
        this.scope.statusList = project.task_statuses;
        this.scope.statusById = groupBy(project.task_statuses, x => x.id);
        return project;
    }

    loadTask() {
        return this.rs.tasks.getByRef(this.scope.projectId, this.params.taskref).then(task => {
            let ctx;
            this.scope.task = task;
            this.scope.taskId = task.id;
            this.scope.commentModel = task;

            this.modelTransform.setObject(this.scope, 'task');

            if ((this.scope.task.neighbors.previous != null ? this.scope.task.neighbors.previous.ref : undefined) != null) {
                ctx = {
                    project: this.scope.project.slug,
                    ref: this.scope.task.neighbors.previous.ref
                };
                this.scope.previousUrl = this.navUrls.resolve("project-tasks-detail", ctx);
            }

            if ((this.scope.task.neighbors.next != null ? this.scope.task.neighbors.next.ref : undefined) != null) {
                ctx = {
                    project: this.scope.project.slug,
                    ref: this.scope.task.neighbors.next.ref
                };
                this.scope.nextUrl = this.navUrls.resolve("project-tasks-detail", ctx);
            }
            return task;
        });
    }

    loadSprint() {
        if (this.scope.task.milestone) {
            return this.rs.sprints.get(this.scope.task.project, this.scope.task.milestone).then(sprint => {
                this.scope.sprint = sprint;
                return sprint;
            });
        }
    }

    loadUserStory() {
        if (this.scope.task.user_story) {
            return this.rs.userstories.get(this.scope.task.project, this.scope.task.user_story).then(us => {
                this.scope.us = us;
                return us;
            });
        }
    }

    loadInitialData() {
        let project = this.loadProject();

        this.fillUsersAndRoles(project.members, project.roles);
        return this.loadTask().then(() => this.q.all([this.loadSprint(), this.loadUserStory()]));
    }

    /*
     * Note: This methods (onUpvote() and onDownvote()) are related to tg-vote-button.
     *       See app/modules/components/vote-button for more info
     */
    onUpvote() {
        let onSuccess = () => {
            this.loadTask();
            return this.rootscope.$broadcast("object:updated");
        };
        let onError = () => {
            return this.confirm.notify("error");
        };

        return this.rs.tasks.upvote(this.scope.taskId).then(onSuccess, onError);
    }

    onDownvote() {
        let onSuccess = () => {
            this.loadTask();
            return this.rootscope.$broadcast("object:updated");
        };
        let onError = () => {
            return this.confirm.notify("error");
        };

        return this.rs.tasks.downvote(this.scope.taskId).then(onSuccess, onError);
    }

    /*
     * Note: This methods (onWatch() and onUnwatch()) are related to tg-watch-button.
     *       See app/modules/components/watch-button for more info
     */
    onWatch() {
        let onSuccess = () => {
            this.loadTask();
            return this.rootscope.$broadcast("object:updated");
        };
        let onError = () => {
            return this.confirm.notify("error");
        };

        return this.rs.tasks.watch(this.scope.taskId).then(onSuccess, onError);
    }

    onUnwatch() {
        let onSuccess = () => {
            this.loadTask();
            return this.rootscope.$broadcast("object:updated");
        };
        let onError = () => {
            return this.confirm.notify("error");
        };

        return this.rs.tasks.unwatch(this.scope.taskId).then(onSuccess, onError);
    }
}
TaskDetailController.initClass();

module.controller("TaskDetailController", TaskDetailController);


//############################################################################
//# Task status display directive
//############################################################################

let TaskStatusDisplayDirective = function($template, $compile) {
    // Display if a Task is open or closed and its taskboard status.
    //
    // Example:
    //     tg-task-status-display(ng-model="task")
    //
    // Requirements:
    //   - Task object (ng-model)
    //   - scope.statusById object

    let template = $template.get("common/components/status-display.html", true);

    let link = function($scope, $el, $attrs) {
        let render = function(task) {
            let status =  $scope.statusById[task.status];

            let html = template({
                is_closed: status.is_closed,
                status
            });

            html = $compile(html)($scope);
            return $el.html(html);
        };

        $scope.$watch($attrs.ngModel, function(task) {
            if (task != null) { return render(task); }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel"
    };
};

module.directive("tgTaskStatusDisplay", ["$tgTemplate", "$compile", TaskStatusDisplayDirective]);


//############################################################################
//# Task status button directive
//############################################################################

let TaskStatusButtonDirective = function($rootScope, $repo, $confirm, $loading, $modelTransform, $compile, $translate, $template) {
    // Display the status of Task and you can edit it.
    //
    // Example:
    //     tg-task-status-button(ng-model="task")
    //
    // Requirements:
    //   - Task object (ng-model)
    //   - scope.statusById object
    //   - $scope.project.my_permissions

    let template = $template.get("common/components/status-button.html", true);

    let link = function($scope, $el, $attrs, $model) {
        let status;
        let isEditable = () => $scope.project.my_permissions.indexOf("modify_task") !== -1;

        let render = task => {
            status = $scope.statusById[task.status];

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

            let transform = $modelTransform.save(function(task) {
                task.status = status;

                return task;
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
            let task = $model.$modelValue;
            if (task) { return render(task); }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel"
    };
};

module.directive("tgTaskStatusButton", ["$rootScope", "$tgRepo", "$tgConfirm", "$tgLoading", "$tgQueueModelTransformation",
                                        "$compile", "$translate", "$tgTemplate", TaskStatusButtonDirective]);


let TaskIsIocaineButtonDirective = function($rootscope, $tgrepo, $confirm, $loading, $modelTransform, $compile, $template) {
    let template = $template.get("issue/iocaine-button.html", true);

    let link = function($scope, $el, $attrs, $model) {
        let isEditable = () => $scope.project.my_permissions.indexOf("modify_task") !== -1;

        let render = function(task) {
            if (!isEditable() && !task.is_iocaine) {
                $el.html("");
                return;
            }

            let ctx = {
                isIocaine: task.is_iocaine,
                isEditable: isEditable()
            };
            let html = $compile(template(ctx))($scope);
            return $el.html(html);
        };

        let save = function(is_iocaine) {
            let currentLoading = $loading()
                .target($el.find('label'))
                .start();

            let transform = $modelTransform.save(function(task) {
                task.is_iocaine = is_iocaine;

                return task;
            });

            transform.then(() => $rootscope.$broadcast("object:updated"));

            transform.then(null, () => $confirm.notify("error"));

            return transform.finally(() => currentLoading.finish());
        };

        $el.on("click", ".is-iocaine", function(event) {
            if (!isEditable()) { return; }

            let is_iocaine = !$model.$modelValue.is_iocaine;
            return save(is_iocaine);
        });

        $scope.$watch(() => $model.$modelValue != null ? $model.$modelValue.is_iocaine : undefined
        , function() {
            let task = $model.$modelValue;
            if (task) { return render(task); }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel"
    };
};

module.directive("tgTaskIsIocaineButton", ["$rootScope", "$tgRepo", "$tgConfirm", "$tgLoading", "$tgQueueModelTransformation",
                                           "$compile", "$tgTemplate", TaskIsIocaineButtonDirective]);
