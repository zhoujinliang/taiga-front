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
 * File: modules/userstories/detail.coffee
 */

import {groupBy, bindOnce, bindMethods} from "../../utils"
import {PageMixin} from "../controllerMixins"

import * as angular from "angular"
import * as _ from "lodash"

let module = angular.module("taigaUserStories");

//############################################################################
//# User story Detail Controller
//############################################################################

class UserStoryDetailController extends PageMixin {
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
    configService:any
    projectService:any
    wysiwigService:any

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
            "$tgConfig",
            "tgProjectService",
            "tgWysiwygService"
        ];
    }

    constructor(scope, rootscope, repo, confirm, rs, params, q, location,
                  log, appMetaService, navUrls, analytics, translate, modelTransform,
                  errorHandlingService, configService, projectService, wysiwigService) {
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
        this.configService = configService;
        this.projectService = projectService;
        this.wysiwigService = wysiwigService;
        bindMethods(this);

        this.scope.usRef = this.params.usref;
        this.scope.sectionName = this.translate.instant("US.SECTION_NAME");
        this.scope.tribeEnabled = this.configService.config.tribeHost;

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
        let totalTasks = this.scope.tasks.length;
        let closedTasks = _.filter(this.scope.tasks, (t:any) => this.scope.taskStatusById[t.status].is_closed).length;
        let progressPercentage = totalTasks > 0 ? Math.round((100 * closedTasks) / totalTasks) : 0;

        let title = this.translate.instant("US.PAGE_TITLE", {
            userStoryRef: `#${this.scope.us.ref}`,
            userStorySubject: this.scope.us.subject,
            projectName: this.scope.project.name
        });
        let description = this.translate.instant("US.PAGE_DESCRIPTION", {
            userStoryStatus: (this.scope.statusById[this.scope.us.status] != null ? this.scope.statusById[this.scope.us.status].name : undefined) || "--",
            userStoryPoints: this.scope.us.total_points,
            userStoryDescription: angular.element(this.wysiwigService.getHTML(this.scope.us.description) || "").text(),
            userStoryClosedTasks: closedTasks,
            userStoryTotalTasks: totalTasks,
            userStoryProgressPercentage: progressPercentage
        });

        return this.appMetaService.setAll(title, description);
    }

    initializeEventHandlers() {
        this.scope.$on("related-tasks:update", () => {
            this.scope.tasks = _.clone(this.scope.tasks);
            let allClosed = _.every(this.scope.tasks, (task:any) => task.is_closed);

            if (this.scope.us.is_closed !== allClosed) {
                return this.loadUs();
            }
        });

        this.scope.$on("attachment:create", () => {
            return this.analytics.trackEvent("attachment", "create", "create attachment on userstory", 1);
        });

        return this.scope.$on("comment:new", () => {
            return this.loadUs();
        });
    }

    initializeOnDeleteGoToUrl() {
        let ctx:any = {project: this.scope.project.slug};
        this.scope.onDeleteGoToUrl = this.navUrls.resolve("project", ctx);
        if (this.scope.project.is_backlog_activated) {
            if (this.scope.us.milestone) {
                ctx.sprint = this.scope.sprint.slug;
                return this.scope.onDeleteGoToUrl = this.navUrls.resolve("project-taskboard", ctx);
            } else {
                return this.scope.onDeleteGoToUrl = this.navUrls.resolve("project-backlog", ctx);
            }
        } else if (this.scope.project.is_kanban_activated) {
            return this.scope.onDeleteGoToUrl = this.navUrls.resolve("project-kanban", ctx);
        }
    }

    loadProject() {
        let project = this.projectService.project.toJS();

        this.scope.projectId = project.id;
        this.scope.project = project;
        this.scope.$emit('project:loaded', project);
        this.scope.statusList = project.us_statuses;
        this.scope.statusById = groupBy(project.us_statuses, x => x.id);
        this.scope.taskStatusById = groupBy(project.task_statuses, x => x.id);
        this.scope.pointsList = _.sortBy(project.points, "order");
        this.scope.pointsById = groupBy(this.scope.pointsList, e => e.id);
        return project;
    }

    loadUs() {
        let httpParams:any = _.pick(this.location.search(), "milestone", "no-milestone", "kanban-status");
        let { milestone } = httpParams;
        if (milestone) {
            this.rs.userstories.storeQueryParams(this.scope.projectId, {
                milestone,
                order_by: "sprint_order"
            });
        }

        let noMilestone = httpParams["no-milestone"];
        if (noMilestone) {
            this.rs.userstories.storeQueryParams(this.scope.projectId, {
                milestone: "null",
                order_by: "backlog_order"
            });
        }

        let kanbanStaus = httpParams["kanban-status"];
        if (kanbanStaus) {
            this.rs.userstories.storeQueryParams(this.scope.projectId, {
                status: kanbanStaus,
                order_by: "kanban_order"
            });
        }



        return this.rs.userstories.getByRef(this.scope.projectId, this.params.usref).then(us => {
            this.scope.us = us;
            this.scope.usId = us.id;
            this.scope.commentModel = us;

            this.modelTransform.setObject(this.scope, 'us');

            return us;
        });
    }

    loadSprint() {
        if (this.scope.us.milestone) {
            return this.rs.sprints.get(this.scope.us.project, this.scope.us.milestone).then(sprint => {
                this.scope.sprint = sprint;
                return sprint;
            });
        }
    }

    loadTasks() {
        return this.rs.tasks.list(this.scope.projectId, null, this.scope.usId).then(tasks => {
            this.scope.tasks = tasks;
            return tasks;
        });
    }

    loadInitialData() {
        let project = this.loadProject();
        this.fillUsersAndRoles(project.members, project.roles);
        return this.loadUs().then(() => this.q.all([this.loadSprint(), this.loadTasks()]));
    }

    /*
     * Note: This methods (onUpvote() and onDownvote()) are related to tg-vote-button.
     *       See app/modules/components/vote-button for more info
     */
    onUpvote() {
        let onSuccess = () => {
            this.loadUs();
            return this.rootscope.$broadcast("object:updated");
        };
        let onError = () => {
            return this.confirm.notify("error");
        };

        return this.rs.userstories.upvote(this.scope.usId).then(onSuccess, onError);
    }

    onDownvote() {
        let onSuccess = () => {
            this.loadUs();
            return this.rootscope.$broadcast("object:updated");
        };
        let onError = () => {
            return this.confirm.notify("error");
        };

        return this.rs.userstories.downvote(this.scope.usId).then(onSuccess, onError);
    }

    /*
     * Note: This methods (onWatch() and onUnwatch()) are related to tg-watch-button.
     *       See app/modules/components/watch-button for more info
     */
    onWatch() {
        let onSuccess = () => {
            this.loadUs();
            return this.rootscope.$broadcast("object:updated");
        };
        let onError = () => {
            return this.confirm.notify("error");
        };

        return this.rs.userstories.watch(this.scope.usId).then(onSuccess, onError);
    }

    onUnwatch() {
        let onSuccess = () => {
            this.loadUs();
            return this.rootscope.$broadcast("object:updated");
        };
        let onError = () => {
            return this.confirm.notify("error");
        };

        return this.rs.userstories.unwatch(this.scope.usId).then(onSuccess, onError);
    }

    onTribeInfo() {
            let publishTitle = this.translate.instant("US.TRIBE.PUBLISH_MORE_INFO_TITLE");
            let image = $('<img />')
                .attr({
                    'src': `/${(<any>window)._version}/images/monster-fight.png`,
                    'alt': this.translate.instant("US.TRIBE.PUBLISH_MORE_INFO_TITLE")
                });
            let text = this.translate.instant("US.TRIBE.PUBLISH_MORE_INFO_TEXT");
            let publishDesc = $('<div></div>').append(image).append(text);
            return this.confirm.success(publishTitle, publishDesc);
        }
}
UserStoryDetailController.initClass();

module.controller("UserStoryDetailController", UserStoryDetailController);


//############################################################################
//# User story status display directive
//############################################################################

let UsStatusDisplayDirective = function($template, $compile) {
    // Display if a US is open or closed and its kanban status.
    //
    // Example:
    //     tg-us-status-display(ng-model="us")
    //
    // Requirements:
    //   - US object (ng-model)
    //   - scope.statusById object

    let template = $template.get("common/components/status-display.html", true);

    let link = function($scope, $el, $attrs) {
        let render = function(us) {
            let status = $scope.statusById[us.status];

            let html = template({
                is_closed: us.is_closed,
                status
            });

            html = $compile(html)($scope);
            return $el.html(html);
        };

        $scope.$watch($attrs.ngModel, function(us) {
            if (us != null) { return render(us); }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel"
    };
};

module.directive("tgUsStatusDisplay", ["$tgTemplate", "$compile", UsStatusDisplayDirective]);

//############################################################################
//# User story status button directive
//############################################################################

let UsStatusButtonDirective = function($rootScope, $repo, $confirm, $loading, $modelTransform, $template, $compile) {
    // Display the status of a US and you can edit it.
    //
    // Example:
    //     tg-us-status-button(ng-model="us")
    //
    // Requirements:
    //   - Us object (ng-model)
    //   - scope.statusById object
    //   - $scope.project.my_permissions

    let template = $template.get("common/components/status-button.html", true);

    let link = function($scope, $el, $attrs, $model) {
        let status;
        let isEditable = () => $scope.project.my_permissions.indexOf("modify_us") !== -1;

        let render = us => {
            status = $scope.statusById[us.status];

            let html = template({
                status,
                statuses: $scope.statusList,
                editable: isEditable()
            });

            $el.html(html);

            return $compile($el.contents())($scope);
        };

        let save = status => {
            $el.find(".pop-status").popover().close();

            let currentLoading = $loading()
                .target($el.find('.js-edit-status'))
                .start();

            let transform = $modelTransform.save(function(us) {
                us.status = status;

                return us;
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
            status = target.data("status-id");

            return save(status);
        });

        $scope.$watch(() => $model.$modelValue != null ? $model.$modelValue.status : undefined
        , function() {
            let us = $model.$modelValue;

            if (us) { return render(us); }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel"
    };
};

module.directive("tgUsStatusButton", ["$rootScope", "$tgRepo", "$tgConfirm", "$tgLoading","$tgQueueModelTransformation", "$tgTemplate", "$compile",
                                      UsStatusButtonDirective]);


//############################################################################
//# User story team requirements button directive
//############################################################################

let UsTeamRequirementButtonDirective = function($rootscope, $tgrepo, $confirm, $loading, $modelTransform, $template, $compile) {
    let template = $template.get("us/us-team-requirement-button.html", true);

    let link = function($scope, $el, $attrs, $model) {
        let canEdit = () => $scope.project.my_permissions.indexOf("modify_us") !== -1;

        let render = function(us) {
            let ctx = {
                canEdit: canEdit(),
                isRequired: us.team_requirement
            };
            let html = template(ctx);
            html = $compile(html)($scope);

            return $el.html(html);
        };

        let save = function(team_requirement) {
            let currentLoading = $loading()
                .target($el.find("label"))
                .start();

            let transform = $modelTransform.save(function(us) {
                us.team_requirement = team_requirement;

                return us;
            });

            transform.then(() => {
                currentLoading.finish();
                return $rootscope.$broadcast("object:updated");
            });

            return transform.then(null, function() {
                currentLoading.finish();
                return $confirm.notify("error");
            });
        };

        $el.on("click", ".team-requirement", function(event) {
            if (!canEdit()) { return; }

            let team_requirement = !$model.$modelValue.team_requirement;

            return save(team_requirement);
        });

        $scope.$watch(() => $model.$modelValue != null ? $model.$modelValue.team_requirement : undefined
        , function() {
            let us = $model.$modelValue;

            if (us) { return render(us); }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel"
    };
};

module.directive("tgUsTeamRequirementButton", ["$rootScope", "$tgRepo", "$tgConfirm", "$tgLoading", "$tgQueueModelTransformation", "$tgTemplate", "$compile", UsTeamRequirementButtonDirective]);

//############################################################################
//# User story client requirements button directive
//############################################################################

let UsClientRequirementButtonDirective = function($rootscope, $tgrepo, $confirm, $loading, $modelTransform, $template, $compile) {
    let template = $template.get("us/us-client-requirement-button.html", true);

    let link = function($scope, $el, $attrs, $model) {
        let canEdit = () => $scope.project.my_permissions.indexOf("modify_us") !== -1;

        let render = function(us) {
            let ctx = {
                canEdit: canEdit(),
                isRequired: us.client_requirement
            };
            let html = $compile(template(ctx))($scope);
            return $el.html(html);
        };

        let save = function(client_requirement) {
            let currentLoading = $loading()
                .target($el.find("label"))
                .start();

            let transform = $modelTransform.save(function(us) {
                us.client_requirement = client_requirement;

                return us;
            });

            transform.then(() => {
                currentLoading.finish();
                return $rootscope.$broadcast("object:updated");
            });

            return transform.then(null, () => $confirm.notify("error"));
        };

        $el.on("click", ".client-requirement", function(event) {
            if (!canEdit()) { return; }

            let client_requirement = !$model.$modelValue.client_requirement;
            return save(client_requirement);
        });

        $scope.$watch(() => $model.$modelValue != null ? $model.$modelValue.client_requirement : undefined
        , function() {
            let us = $model.$modelValue;
            if (us) { return render(us); }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel"
    };
};

module.directive("tgUsClientRequirementButton", ["$rootScope", "$tgRepo", "$tgConfirm", "$tgLoading", "$tgQueueModelTransformation", "$tgTemplate", "$compile",
                                                 UsClientRequirementButtonDirective]);
